import { useState } from 'react';
import { supabase } from '../lib/supabase';
import * as cloud from '../lib/cloud';
import type { ChildRow } from '../lib/cloud';

export function Brand() {
  return (
    <div className="center auth-brand">
      <img src="/icon.svg" alt="" width={72} height={72} />
      <h1>Level-Up Lab</h1>
      <p className="muted">The study-habit coach for school kids: plan, focus, remember, and grow a creature along the way.</p>
    </div>
  );
}

/** Parents sign in with their email and a 6-digit code. No passwords, and children never need an email. */
export function SignIn() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <div className="setup">
      <Brand />
      <div className="card narrow">
        {step === 'email' ? (
          <form className="stack" onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true); setErr('');
            const { error } = await supabase!.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
            setBusy(false);
            if (error) setErr(error.message); else setStep('code');
          }}>
            <h2>Parent sign-in</h2>
            <p className="muted">Grown-ups sign in, then pick which child is studying. We'll email you a 6-digit code. No password needed.</p>
            <label className="field"><span>Parent's email</span>
              <input type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            {err && <p className="error">{err}</p>}
            <button className="btn primary big" disabled={busy || !email.includes('@')}>{busy ? 'Sending…' : 'Email me a code'}</button>
            <p className="muted small">By continuing you confirm you are the child's parent or guardian. <a href="/privacy.html" target="_blank" rel="noreferrer">Privacy</a></p>
          </form>
        ) : (
          <form className="stack" onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true); setErr('');
            const { error } = await supabase!.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
            setBusy(false);
            if (error) setErr('That code did not work. Check the newest email, or send a new code.');
          }}>
            <h2>Check your email</h2>
            <p className="muted">We sent a code to <strong>{email}</strong>. It can take a minute, and may land in spam.</p>
            <label className="field"><span>6-digit code</span>
              <input inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={10} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="code-input" />
            </label>
            {err && <p className="error">{err}</p>}
            <div className="row">
              <button className="btn primary big" disabled={busy || code.length < 6}>{busy ? 'Checking…' : 'Sign in'}</button>
              <button type="button" className="btn ghost" onClick={() => { setStep('email'); setCode(''); setErr(''); }}>Use a different email</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function Consent({ userId, onDone, onSignOut }: { userId: string; onDone: () => void; onSignOut: () => void }) {
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div className="setup">
      <Brand />
      <div className="card narrow stack">
        <h2>Before your child starts</h2>
        <p>Level-Up Lab is a study coach. It doesn't teach content or show ads, and it doesn't use AI. Here's what it keeps so your child's progress is there on any device:</p>
        <ul>
          <li><strong>Your email</strong>, to sign in and to receive the daily report your child chooses to send.</li>
          <li><strong>Your child's nickname</strong> (no surname, school or photo needed).</li>
          <li><strong>Their study progress</strong>: plan, notes and takeaways, mistakes caught, quiz results, drawings and creature.</li>
        </ul>
        <p>Only you can see your child's notes and drawings. The Level-Up Lab team sees <strong>usage numbers only</strong> (for example study days, minutes and quiz scores) plus any feedback your child sends, to check that the app is helping. You can delete everything at any time from the Parent area.</p>
        <p className="muted small">Full details: <a href="/privacy.html" target="_blank" rel="noreferrer">privacy notice</a>.</p>
        <label className="switch"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /> I am the parent or guardian and I agree.</label>
        {err && <p className="error">{err}</p>}
        <div className="row">
          <button className="btn primary big" disabled={!ok || busy} onClick={async () => {
            setBusy(true);
            try { await cloud.acceptConsent(userId); onDone(); } catch (e) { setErr((e as Error).message); setBusy(false); }
          }}>Continue</button>
          <button className="btn ghost" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

export function ChildPicker({ userId, email, children, onPick, onChanged, onSignOut, onAdmin }: {
  userId: string; email: string; children: ChildRow[];
  onPick: (c: ChildRow) => void; onChanged: () => void; onSignOut: () => void; onAdmin?: () => void;
}) {
  const [adding, setAdding] = useState(children.length === 0);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="setup">
      <Brand />
      <div className="card narrow stack">
        <h2>{children.length ? "Who's studying today?" : 'Add your child'}</h2>
        <div className="child-grid">
          {children.map((c) => (
            <button key={c.id} className="child-card" onClick={() => onPick(c)}>
              <span className="avatar" aria-hidden="true">{c.nickname.slice(0, 1).toUpperCase()}</span>
              <span>{c.nickname}</span>
            </button>
          ))}
          {!adding && children.length < 6 && <button className="child-card add" onClick={() => setAdding(true)}><span className="avatar">+</span><span>Add a child</span></button>}
        </div>
        {adding && (
          <form className="row wrap" onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true); setErr('');
            try { await cloud.createChild(userId, name.trim()); setName(''); setAdding(false); onChanged(); } catch (x) { setErr((x as Error).message); }
            setBusy(false);
          }}>
            <input autoFocus maxLength={30} placeholder="Child's first name or nickname" value={name} onChange={(e) => setName(e.target.value)} aria-label="Child's nickname" />
            <button className="btn primary" disabled={!name.trim() || busy}>Add</button>
            {children.length > 0 && <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Cancel</button>}
          </form>
        )}
        {err && <p className="error">{err}</p>}
        <div className="row between wrap">
          <span className="muted small">Signed in as {email}</span>
          <div className="row">
            {onAdmin && <button className="btn small" onClick={onAdmin}>Admin dashboard</button>}
            <button className="btn ghost small" onClick={onSignOut}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
