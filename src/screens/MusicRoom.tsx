import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { BACKINGS, KEYS, playTone, startBacking } from '../lib/backing';
import { centsOff, detectPitch, freqToMidi, noteName } from '../lib/pitch';
import { deleteImage, getImage, putImage } from '../lib/db';
import { usePlayMeter } from '../lib/usePlayMeter';
import { uid } from '../engine/planner';
import { lines } from '../lib/voice';
import { play } from '../lib/sound';
import { Bubble } from '../components/Bubble';
import type { Screen } from '../App';

type Tab = 'warmup' | 'ear' | 'studio' | 'songs';

let sharedCtx: AudioContext | null = null;
function audio(): AudioContext {
  sharedCtx ??= new AudioContext();
  if (sharedCtx.state === 'suspended') void sharedCtx.resume();
  return sharedCtx;
}

/** One microphone stream for the whole room, asked for only when a mic game starts. */
function useMic() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [err, setErr] = useState('');
  const ask = async () => {
    if (stream) return stream;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
      setStream(s);
      setErr('');
      return s;
    } catch {
      setErr('The microphone is blocked. Click the lock or mic icon in the address bar and allow the microphone, then try again.');
      return null;
    }
  };
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);
  return { stream, ask, err };
}

export function MusicRoom({ go }: { go: (s: Screen) => void }) {
  const { leftSec, timeUp } = usePlayMeter('music');
  const [tab, setTab] = useState<Tab>('warmup');
  const mic = useMic();

  return (
    <div className="page music-room">
      <div className="row between wrap">
        <h1>Music corner</h1>
        <div className="row wrap">
          <span className="pill strong" aria-live="polite">{Math.floor(leftSec / 60)} min left</span>
          <div className="tabs" role="tablist">
            {([['warmup', '🎤 Voice warm-up'], ['ear', '👂 Ear game'], ['studio', '🎙️ Sing-along studio'], ['songs', '💾 My songs']] as [Tab, string][]).map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
          <button className="btn ghost" onClick={() => go('rooms')}>Leave</button>
        </div>
      </div>
      {mic.err && <p className="hint">{mic.err}</p>}
      {tab === 'warmup' && <WarmUp mic={mic} />}
      {tab === 'ear' && <EarGame />}
      {tab === 'studio' && <Studio mic={mic} onSaved={() => setTab('songs')} />}
      {tab === 'songs' && <Songs />}
      {timeUp && (
        <div className="overlay">
          <div className="modal center">
            <Bubble>{lines.timeUp}</Bubble>
            <button className="btn primary" onClick={() => go('home')}>Back home</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Voice warm-up: hear a note, sing it, the meter shows if you're in tune ---------- */

const RANGES = {
  high: { label: 'Higher voice', notes: [60, 62, 64, 65, 67, 69, 71, 72] },  // C4–C5
  low: { label: 'Lower voice', notes: [55, 57, 59, 60, 62, 64, 65, 67] },    // G3–G4
};
const ROUNDS = 5;
const HOLD_MS = 700;   // in tune for this long = success
const LISTEN_MS = 7000;

function WarmUp({ mic }: { mic: ReturnType<typeof useMic> }) {
  const best = useStore((s) => s.singingBest ?? 0);
  const recordScore = useStore((s) => s.recordSingingScore);
  const [range, setRange] = useState<keyof typeof RANGES>('high');
  const [round, setRound] = useState(-1); // -1 = not started
  const [target, setTarget] = useState(60);
  const [phase, setPhase] = useState<'listen' | 'sing' | 'hit' | 'miss' | 'done'>('listen');
  const [cents, setCents] = useState<number | null>(null);
  const [heard, setHeard] = useState<number | null>(null);
  const [hold, setHold] = useState(0);
  const [score, setScore] = useState(0);
  const raf = useRef(0);

  const stopListening = () => cancelAnimationFrame(raf.current);
  useEffect(() => stopListening, []);

  const startRound = async (r: number, sc: number) => {
    const stream = await mic.ask();
    if (!stream) return;
    const notes = RANGES[range].notes;
    const t = notes[Math.floor(Math.random() * notes.length)];
    setRound(r); setTarget(t); setPhase('listen'); setCents(null); setHeard(null); setHold(0); setScore(sc);
    const ctx = audio();
    playTone(ctx, t, 1.2);
    setTimeout(() => {
      setPhase('sing');
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 2048;
      src.connect(an);
      const buf = new Float32Array(an.fftSize);
      const start = performance.now();
      let inTune = 0, last = performance.now();
      const loop = () => {
        const now = performance.now();
        an.getFloatTimeDomainData(buf);
        const f = detectPitch(buf, ctx.sampleRate);
        if (f) {
          const c = centsOff(f, t);
          setCents(c); setHeard(freqToMidi(f));
          inTune = Math.abs(c) < 45 ? inTune + (now - last) : Math.max(0, inTune - (now - last) / 2);
        } else { setCents(null); inTune = Math.max(0, inTune - (now - last) / 3); }
        last = now;
        setHold(Math.min(1, inTune / HOLD_MS));
        if (inTune >= HOLD_MS) { src.disconnect(); setPhase('hit'); play('accept'); next(r, sc + 1); return; }
        if (now - start > LISTEN_MS) { src.disconnect(); setPhase('miss'); play('nudge'); next(r, sc); return; }
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
    }, 1300);
  };

  const next = (r: number, sc: number) => {
    setScore(sc);
    setTimeout(() => {
      if (r + 1 >= ROUNDS) { setPhase('done'); recordScore(sc); if (sc >= 4) play('sparkle'); }
      else void startRound(r + 1, sc);
    }, 1200);
  };

  const needle = cents === null ? 0 : Math.max(-100, Math.min(100, cents));
  const tuned = cents !== null && Math.abs(cents) < 45;

  if (round < 0 || phase === 'done') {
    return (
      <div className="card narrow center stack">
        {phase === 'done'
          ? <><h2>{score} / {ROUNDS} notes in tune!</h2><p>{score >= 4 ? 'Wonderful pitch, your creature is humming along.' : score >= 2 ? 'Nice warm-up! Try matching a bit longer on each note.' : 'Voices take practice. Try singing a little softer and steadier.'}</p></>
          : <><h2>Voice warm-up</h2><p>The app plays a note. Sing it back on "ooo" or "laa" and hold it steady until the ring fills up. {ROUNDS} notes per round.</p></>}
        <div className="seg">
          {(Object.keys(RANGES) as (keyof typeof RANGES)[]).map((k) => <button key={k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{RANGES[k].label}</button>)}
        </div>
        <button className="btn primary big" onClick={() => startRound(0, 0)}>{phase === 'done' ? 'Sing again' : 'Start warm-up'}</button>
        {best > 0 && <p className="muted small">Your best: {best} / {ROUNDS}</p>}
        <p className="muted small">Uses the microphone. Nothing is recorded or sent anywhere.</p>
      </div>
    );
  }

  return (
    <div className="card narrow center stack">
      <p className="kicker">Note {round + 1} of {ROUNDS} · score {score}</p>
      <div className={`tune-ring ${tuned ? 'tuned' : ''} ${phase}`} style={{ '--hold': hold } as React.CSSProperties}>
        <div className="tune-inner">
          <span className="tune-note">{noteName(target)}</span>
          <span className="muted small">{phase === 'listen' ? 'Listen…' : phase === 'sing' ? 'Now sing!' : phase === 'hit' ? 'In tune! ✓' : 'Next one…'}</span>
        </div>
      </div>
      <div className="tune-meter" aria-label="Tuning meter">
        <span className="tune-zone" />
        <span className="tune-needle" style={{ left: `${50 + needle / 2}%`, opacity: cents === null ? 0.25 : 1 }} />
        <span className="tune-lbl l">lower</span><span className="tune-lbl r">higher</span>
      </div>
      <p className="muted small">{heard !== null && phase === 'sing' ? `You're singing ${noteName(heard)}${tuned ? ': spot on!' : (cents ?? 0) < 0 ? ', go a little higher' : ', go a little lower'}` : ' '}</p>
      <div className="row center-row">
        <button className="btn small" onClick={() => playTone(audio(), target, 1.2)}>Hear it again</button>
        <button className="btn ghost small" onClick={() => { stopListening(); setRound(-1); setPhase('listen'); }}>Stop</button>
      </div>
    </div>
  );
}

/* ---------- Ear game: which note is higher? Gets harder as the streak grows ---------- */

function EarGame() {
  const [pair, setPair] = useState<[number, number] | null>(null);
  const [answer, setAnswer] = useState<'first' | 'second' | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [played, setPlayed] = useState(0);

  const newPair = () => {
    const gap = Math.max(1, 7 - Math.floor(streak / 2)); // starts with big jumps, shrinks to a semitone
    const a = 57 + Math.floor(Math.random() * 12);
    const b = Math.random() < 0.5 ? a + gap : a - gap;
    setPair([a, b]); setAnswer(null); setPlayed((n) => n + 1);
    playBoth([a, b]);
  };
  const playBoth = ([a, b]: [number, number]) => {
    const ctx = audio();
    playTone(ctx, a, 0.7);
    setTimeout(() => playTone(ctx, b, 0.7), 850);
  };
  const choose = (c: 'first' | 'second') => {
    if (!pair || answer) return;
    const right = (pair[0] > pair[1] ? 'first' : 'second') === c;
    setAnswer(c);
    if (right) { const s = streak + 1; setStreak(s); setBest(Math.max(best, s)); play('accept'); }
    else { setStreak(0); play('nudge'); }
  };
  const correct = pair ? (pair[0] > pair[1] ? 'first' : 'second') : null;

  return (
    <div className="card narrow center stack">
      <h2>Which note is higher?</h2>
      <p className="muted">Listen to two notes, then pick the higher one. The gap gets smaller as your streak grows.</p>
      {!pair ? <button className="btn primary big" onClick={newPair}>Play the first pair</button> : (
        <>
          <div className="row center-row">
            {(['first', 'second'] as const).map((c) => (
              <button key={c} className={`btn big ear-btn ${answer && c === correct ? 'right' : ''} ${answer === c && c !== correct ? 'wrong' : ''}`} onClick={() => choose(c)}>
                {c === 'first' ? '1st note' : '2nd note'}
              </button>
            ))}
          </div>
          {answer && <p className="big">{answer === correct ? 'Yes! 🎉' : `Not quite: the ${correct} note was higher.`}</p>}
          <div className="row center-row">
            <button className="btn small" onClick={() => playBoth(pair)}>Play again</button>
            {answer && <button className="btn primary" onClick={newPair} autoFocus>Next pair</button>}
          </div>
        </>
      )}
      <p className="muted small">Streak {streak} · best today {best}{played ? ` · ${played} played` : ''}</p>
    </div>
  );
}

/* ---------- Sing-along studio: pick a backing track, record your voice over it ---------- */

const MAX_SECONDS = 90;

function Studio({ mic, onSaved }: { mic: ReturnType<typeof useMic>; onSaved: () => void }) {
  const addSong = useStore((s) => s.addSong);
  const [backing, setBacking] = useState(BACKINGS[0].id);
  const [key, setKey] = useState(4); // G
  const [speed, setSpeed] = useState(1);
  const [state, setState] = useState<'idle' | 'preview' | 'count' | 'rec' | 'review'>('idle');
  const [beatNo, setBeatNo] = useState(0);
  const [secs, setSecs] = useState(0);
  const [clip, setClip] = useState<{ url: string; blob: Blob; seconds: number } | null>(null);
  const [title, setTitle] = useState('');
  const stopRef = useRef<() => void>(() => undefined);
  const b = BACKINGS.find((x) => x.id === backing)!;

  useEffect(() => () => stopRef.current(), []);

  const preview = () => {
    stopRef.current();
    if (state === 'preview') { setState('idle'); return; }
    const ctx = audio();
    const stop = startBacking(ctx, ctx.destination, b, KEYS[key].root, speed, setBeatNo);
    stopRef.current = () => { stop(); };
    setState('preview');
  };

  const record = async () => {
    stopRef.current();
    const stream = await mic.ask();
    if (!stream) return;
    const ctx = audio();
    const dest = ctx.createMediaStreamDestination();
    const music = ctx.createGain(); music.gain.value = 0.55;
    music.connect(ctx.destination);   // she hears the backing
    music.connect(dest);              // and it's in the recording
    const voice = ctx.createMediaStreamSource(stream);
    const vg = ctx.createGain(); vg.gain.value = 1.4;
    voice.connect(vg).connect(dest);  // her voice only goes to the recording (no echo in the speakers)
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    const mimeType = types.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(dest.stream, mimeType ? { mimeType, audioBitsPerSecond: 64000 } : undefined);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    let started = 0;
    let tick: ReturnType<typeof setInterval> | undefined;
    const stopBacking = startBacking(ctx, music, b, KEYS[key].root, speed, (n) => {
      setBeatNo(n);
      if (n === 4) { rec.start(); started = Date.now(); setState('rec'); tick = setInterval(() => {
        const s = Math.round((Date.now() - started) / 1000);
        setSecs(s);
        if (s >= MAX_SECONDS) finish();
      }, 250); }
    });
    setState('count'); setSecs(0);
    const finish = () => {
      stopBacking(); if (tick) clearInterval(tick);
      if (rec.state === 'recording') rec.stop();
      voice.disconnect(); music.disconnect();
    };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      const seconds = Math.max(1, Math.round((Date.now() - started) / 1000));
      setClip({ url: URL.createObjectURL(blob), blob, seconds });
      setState('review');
      setTitle(`${b.name} take`);
    };
    stopRef.current = finish;
  };

  const save = async () => {
    if (!clip) return;
    const dataUrl = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(clip.blob); });
    const id = uid('song');
    await putImage(id, dataUrl); // stays on this device
    addSong({ id, title: title.trim() || 'My song', createdAt: new Date().toISOString(), seconds: clip.seconds, backing: b.name });
    play('sparkle');
    setClip(null); setState('idle');
    onSaved();
  };

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Choose your backing track</h2>
        <div className="backing-grid">
          {BACKINGS.map((x) => (
            <button key={x.id} className={`backing ${backing === x.id ? 'on' : ''}`} onClick={() => { setBacking(x.id); if (state === 'preview') { stopRef.current(); setState('idle'); } }} disabled={state === 'count' || state === 'rec'}>
              <strong>{x.name}</strong><span className="small muted">{x.mood} · {x.bpm} bpm</span>
            </button>
          ))}
        </div>
        <div className="row wrap">
          <label className="field inline"><span>Key</span>
            <select value={key} onChange={(e) => setKey(+e.target.value)} disabled={state === 'count' || state === 'rec'}>
              {KEYS.map((k, i) => <option key={k.name} value={i}>{k.name}</option>)}
            </select>
          </label>
          <label className="field inline"><span>Speed</span>
            <select value={speed} onChange={(e) => setSpeed(+e.target.value)} disabled={state === 'count' || state === 'rec'}>
              <option value={0.85}>Slower</option><option value={1}>Normal</option><option value={1.15}>Faster</option>
            </select>
          </label>
          <button className="btn" onClick={preview} disabled={state === 'count' || state === 'rec'}>{state === 'preview' ? '■ Stop' : '▶ Listen'}</button>
        </div>
        <p className="muted small">Sing any song you know, or make one up! Headphones help: then only your voice is picked up, not the music twice.</p>
      </div>

      <div className="card center stack">
        {state === 'review' && clip ? (
          <>
            <h2>Listen back</h2>
            <audio src={clip.url} controls className="song-audio" />
            <input value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} aria-label="Song title" placeholder="Name your song" />
            <div className="row center-row">
              <button className="btn primary big" onClick={save}>Save to My songs</button>
              <button className="btn" onClick={() => { setClip(null); setState('idle'); }}>Try again</button>
            </div>
          </>
        ) : state === 'count' || state === 'rec' ? (
          <>
            <div className={`rec-light ${state === 'rec' ? 'on' : ''}`} />
            <h2>{state === 'count' ? `Get ready… ${4 - Math.min(beatNo, 3)}` : `Recording ${secs}s / ${MAX_SECONDS}s`}</h2>
            <div className="beat-dots">{[0, 1, 2, 3].map((i) => <span key={i} className={beatNo % 4 === i ? 'on' : ''} />)}</div>
            <button className="btn primary big" onClick={() => stopRef.current()}>■ Stop</button>
          </>
        ) : (
          <>
            <h2>Ready to sing?</h2>
            <p className="muted">You'll hear 4 beats to count you in, then recording starts. Up to {MAX_SECONDS} seconds.</p>
            <button className="btn primary big" onClick={record}>● Record</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- My songs ---------- */

function Songs() {
  const s = useStore();
  const songs = s.songs ?? [];
  if (!songs.length) return <div className="card"><p className="muted">Songs you record in the studio will appear here. They stay on this device.</p></div>;
  return (
    <div className="stack">
      {songs.map((x) => <SongRow key={x.id} id={x.id} />)}
      <p className="muted small">Recordings are kept only on this device and are never uploaded.</p>
    </div>
  );
}

function SongRow({ id }: { id: string }) {
  const s = useStore();
  const song = (s.songs ?? []).find((x) => x.id === id)!;
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  useEffect(() => { getImage(id).then((v) => setUrl(v ?? null)); }, [id]);
  return (
    <div className="card song-row">
      <div className="row between wrap">
        <input className="song-title" value={song.title} maxLength={40} onChange={(e) => s.renameSong(id, e.target.value)} aria-label="Song title" />
        <span className="muted small">{new Date(song.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {song.seconds}s{song.backing ? ` · ${song.backing}` : ''}</span>
      </div>
      {url ? <audio src={url} controls className="song-audio" /> : url === null ? <p className="muted small">Recorded on another device.</p> : null}
      <div className="row">
        {url && <a className="btn small" href={url} download={`${song.title || 'song'}.webm`}>Download</a>}
        <button className="btn ghost small" onClick={async () => { if (confirm(`Delete "${song.title}"?`)) { await deleteImage(id); s.removeSong(id); } }}>Delete</button>
      </div>
    </div>
  );
}
