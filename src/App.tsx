import { useCallback, useEffect, useState } from 'react';
import type { Session as AuthSession } from '@supabase/supabase-js';
import { useStore } from './store';
import { todayKey } from './engine/dates';
import { unsentReportDay } from './store/selectors';
import { cloudEnabled, supabase } from './lib/supabase';
import * as cloud from './lib/cloud';
import type { ChildRow } from './lib/cloud';
import { closeChild, onSyncStatus, openChild, type SyncStatus } from './lib/sync';
import { AccountContext, useAccount, type Account } from './lib/account';
import { Setup } from './screens/Setup';
import { Home } from './screens/Home';
import { PlanBuilder } from './screens/PlanBuilder';
import { Session } from './screens/Session';
import { Rooms } from './screens/Rooms';
import { ArtRoom } from './screens/ArtRoom';
import { Notebook } from './screens/Notebook';
import { Parent } from './screens/Parent';
import { Report } from './screens/Report';
import { Admin } from './screens/Admin';
import { Worksheets } from './screens/Worksheets';
import { MusicRoom } from './screens/MusicRoom';
import { ChildPicker, Consent, SignIn } from './screens/Auth';
import { Celebration } from './components/Celebration';

export type Screen = 'home' | 'plan' | 'session' | 'rooms' | 'art' | 'insights' | 'parent' | 'report-past' | 'admin' | 'worksheets' | 'music';

const NAV: { id: Screen; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'session', label: 'Study' },
  { id: 'plan', label: 'Plan' },
  { id: 'worksheets', label: 'Worksheets' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'insights', label: 'Notebook' },
];

const Loading = ({ text = 'Opening the door…' }: { text?: string }) => <div className="loading">{text}</div>;

/** Sign-in → consent → pick a child → load that child's progress → the app. */
export default function Root() {
  useEffect(() => { void navigator.storage?.persist?.(); }, []);
  return cloudEnabled ? <CloudRoot /> : <LocalRoot />;
}

/** No Supabase configured: one child on this device only (development / offline demo). */
function LocalRoot() {
  const [ready, setReady] = useState(false);
  useEffect(() => { openChild('local').then(() => setReady(true)); }, []);
  const account: Account = {
    mode: 'local', childId: 'local', isAdmin: false,
    switchChild: () => undefined, signOut: () => undefined, openAdmin: () => undefined, childRemoved: () => undefined,
  };
  if (!ready) return <Loading />;
  return <AccountContext.Provider value={account}><AppShell /></AccountContext.Provider>;
}

function CloudRoot() {
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined);
  const [consent, setConsent] = useState<boolean | undefined>(undefined);
  const [children, setChildren] = useState<ChildRow[] | undefined>(undefined);
  const [child, setChild] = useState<ChildRow | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase!.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase!.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  const refreshChildren = useCallback(() => cloud.listChildren().then(setChildren).catch((e) => setErr(e.message)), []);

  useEffect(() => {
    if (!userId) { setConsent(undefined); setChildren(undefined); setChild(null); setIsAdmin(false); return; }
    cloud.hasConsent().then(setConsent).catch((e) => setErr(e.message));
    void refreshChildren();
    cloud.isAdmin().then(setIsAdmin);
  }, [userId, refreshChildren]);

  // remember the last child picked on this device
  useEffect(() => {
    if (children && !child) {
      const last = localStorageGet('lastChild');
      const found = children.find((c) => c.id === last);
      if (found) setChild(found);
    }
  }, [children]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!child) return;
    setLoaded(false);
    localStorageSet('lastChild', child.id);
    openChild(child.id).then(() => setLoaded(true));
  }, [child]);

  const signOut = async () => { await closeChild(); setChild(null); setLoaded(false); await supabase!.auth.signOut(); };
  const switchChild = async () => { await closeChild(); localStorageSet('lastChild', ''); setChild(null); setLoaded(false); };

  if (err) return <div className="setup"><div className="card narrow"><p className="error">{err}</p><button className="btn" onClick={() => location.reload()}>Try again</button></div></div>;
  if (session === undefined) return <Loading />;
  if (!session) return <SignIn />;
  if (consent === undefined || children === undefined) return <Loading />;
  if (!consent) return <Consent userId={session.user.id} onDone={() => setConsent(true)} onSignOut={signOut} />;
  if (adminOpen) return <div className="app"><main><Admin onBack={() => setAdminOpen(false)} /></main></div>;
  if (!child) {
    return (
      <ChildPicker
        userId={session.user.id} email={session.user.email ?? ''} children={children}
        onPick={setChild} onChanged={refreshChildren} onSignOut={signOut}
        onAdmin={isAdmin ? () => setAdminOpen(true) : undefined}
      />
    );
  }
  if (!loaded) return <Loading text={`Opening ${child.nickname}'s lab…`} />;

  const account: Account = {
    mode: 'cloud', email: session.user.email, childId: child.id, childNickname: child.nickname, isAdmin,
    switchChild, signOut, openAdmin: async () => { await switchChild(); setAdminOpen(true); },
    childRemoved: async () => { await switchChild(); await refreshChildren(); },
  };
  return <AccountContext.Provider value={account}><AppShell key={child.id} /></AccountContext.Provider>;
}

function localStorageGet(k: string) { try { return localStorage.getItem(k) ?? ''; } catch { return ''; } }
function localStorageSet(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }

function AppShell() {
  const account = useAccount();
  const profile = useStore((s) => s.profile);
  const muted = useStore((s) => s.settings.muted);
  const setMuted = useStore((s) => s.setMuted);
  const activeBlock = useStore((s) => s.activeBlock);
  // reopen on the screen the child was on, so an interruption doesn't lose their place
  const screenKey = `screen:${account.childId}`;
  const [screen, setScreen] = useState<Screen>(() => {
    try {
      const v = localStorage.getItem(screenKey) as Screen | null;
      return v && ['home', 'session', 'plan', 'worksheets', 'rooms', 'insights', 'parent'].includes(v) ? v : 'home';
    } catch { return 'home'; }
  });
  useEffect(() => { try { localStorage.setItem(screenKey, screen); } catch { /* private mode */ } }, [screenKey, screen]);
  const [sync, setSync] = useState<SyncStatus>('saved');

  useEffect(() => onSyncStatus(setSync), []);
  useEffect(() => { if (activeBlock) setScreen('session'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.documentElement.dataset.world = profile?.world ?? 'emberwick'; }, [profile?.world]);

  if (!profile) return <Setup name={account.childNickname} />;

  const go = (s: Screen) => { setScreen(s); window.scrollTo(0, 0); };
  const inRoom = screen === 'art' || screen === 'music';

  return (
    <div className="app">
      <header className="topbar no-print">
        <button className="brand" onClick={() => go('home')}>Level-Up Lab</button>
        {!inRoom && (
          <nav aria-label="Main">
            {NAV.map((n) => (
              <button key={n.id} className={screen === n.id ? 'on' : ''} aria-current={screen === n.id ? 'page' : undefined} onClick={() => go(n.id)}>{n.label}</button>
            ))}
          </nav>
        )}
        <div className="topbar-right">
          {account.mode === 'cloud' && sync === 'offline' && <span className="pill small" title="Saved on this device. It will sync when you're back online.">Offline</span>}
          <button className="btn ghost small" onClick={() => setMuted(!muted)} aria-label={muted ? 'Turn sound on' : 'Mute sound'}>{muted ? '🔇' : '🔊'}</button>
          {!inRoom && account.mode === 'cloud' && <button className="btn ghost small" onClick={account.switchChild} title="Switch child">{profile.name} ▾</button>}
          {!inRoom && <button className="btn ghost small" onClick={() => go('parent')}>Parent</button>}
        </div>
      </header>
      <main>
        {screen === 'home' && <Home go={go} />}
        {screen === 'session' && <Session go={go} />}
        {screen === 'plan' && <PlanBuilder />}
        {screen === 'rooms' && <Rooms go={go} />}
        {screen === 'art' && <ArtRoom go={go} />}
        {screen === 'music' && <MusicRoom go={go} />}
        {screen === 'insights' && <Notebook />}
        {screen === 'worksheets' && <Worksheets />}
        {screen === 'parent' && <Parent go={go} />}
        {screen === 'report-past' && <PastReport go={go} />}
      </main>
      <Celebration />
    </div>
  );
}

function PastReport({ go }: { go: (s: Screen) => void }) {
  const s = useStore();
  const day = unsentReportDay(s, todayKey());
  if (!day) return <div className="page"><div className="card narrow center"><p>All caught up, {s.profile?.parentLabel ?? 'your grown-up'} has every report.</p><button className="btn" onClick={() => go('home')}>Home</button></div></div>;
  return <Report date={day} onDone={() => go('home')} onBack={() => go('home')} />;
}
