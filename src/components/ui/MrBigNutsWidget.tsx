import { useEffect, useMemo, useRef, useState } from "react";
import { answerQuestion } from "@/lib/bigNutsBrain";
import {
  MIC_STATUS_COPY,
  MIC_UNSUPPORTED_MESSAGE,
  diagnoseMic,
  recognitionSupported,
  speak,
  startListeningSession,
  stopSpeaking,
  type MicStatus,
  type VoicePersona,
} from "@/lib/botVoice";
import { siteConfig } from "@/data/siteConfig";

type Msg = { role: "bot" | "user"; text: string };

/* ------------------------------------------------------------------ */
/* Personas — the admin control room cast. Boss order 2026-11-07: the  */
/* admin bot cusses, talks funny, and sounds human: a drunken          */
/* hillbilly, a pirate, or a trashy lady. Voice = the browser's most   */
/* human local voice, bent with pitch/rate per character.              */
/* ------------------------------------------------------------------ */

interface Persona {
  id: string;
  label: string;
  voice: VoicePersona;
  jokeIntro: string[];
  chatter: string[];
}

const PERSONAS: Persona[] = [
  {
    id: "hillbilly",
    label: "🍺 Drunken Hillbilly",
    voice: { gender: "male", pitch: 0.66, rate: 0.86 },
    jokeIntro: [
      "Well shit, hold my beer and listen to this one…",
      "Lord have mercy, this one right here kills me every damn time…",
      "I ain't told this one since the last family reunion got shut down…",
    ],
    chatter: [
      "Hell yeah, Taylor, we're runnin' this sumbitch like a small block Chevy.",
      "I done checked the whole place twice and drank once. Priorities.",
      "You keep clickin' like that and we're gonna need a bigger still.",
    ],
  },
  {
    id: "pirate",
    label: "🏴‍☠️ Pirate",
    voice: { gender: "male", pitch: 0.55, rate: 0.9 },
    jokeIntro: [
      "Arr, gather round ye scurvy bastards, laugh or swim…",
      "Hoist the giggles, ye dogs — Cap'n's got a joke…",
      "This one be funnier than a one-legged man at an ass-kickin' contest…",
    ],
    chatter: [
      "The ship be runnin' tighter than a rum barrel in a storm, Cap'n Taylor.",
      "Any scallywag messes with this site, we feed 'em to the damn sharks.",
      "I counted the treasure twice. Mostly 'cause I can't count past ten with these hooks.",
    ],
  },
  {
    id: "lady",
    label: "💅 Trashy Lady",
    voice: { gender: "female", pitch: 1.18, rate: 1.02 },
    jokeIntro: [
      "Oh honey, sit your ass down for this one…",
      "Baby, I heard this at the salon and spit my damn sweet tea everywhere…",
      "This one's trashier than my third wedding, and that's sayin' somethin'…",
    ],
    chatter: [
      "Mmhmm, Taylor baby, this control room is lookin' finer than my parole officer.",
      "I run this place like I run my exes — loud, proud, and slightly drunk.",
      "Anybody gives you trouble, sugar, I'll scratch their damn eyes out with these nails.",
    ],
  },
];

const JOKES: string[] = [
  "You might be a redneck if your wedding was catered by a gas station and nobody complained — the chicken was that damn good.",
  "Why don't pirates shower before they walk the plank? Because they just wash up on shore later, dumbass.",
  "Marriage is like a deck of cards: starts with hearts and diamonds, and by the end you're just lookin' for clubs and spades.",
  "My granddaddy's so country, he thinks a hot tub is a pot of beans nobody stirred yet.",
  "A blonde walks into a library, yells 'I'll have a burger and fries!' The librarian whispers 'This is a library.' So the blonde whispers back… 'sorry — I'll have a burger and fries.'",
  "Why did the hillbilly bring a ladder to the bar? He heard the drinks were on the house.",
  "What's a pirate's favorite letter? You'd think it's R, but his first love be the C.",
  "My wife said I never listen to her. That's a weird-ass place to start a conversation, but go on, honey.",
  "You might be a redneck if your family tree has a tire swing and a restraining order on the same branch.",
  "Why do pirates wear eye patches? Depth perception is for sober people, and ain't nobody on this ship sober.",
  "A Georgia boy and an Alabama boy are peeing off a bridge. Georgia boy says 'this water's cold.' Alabama boy says 'and it's deep too.'",
  "What do you call a lady with three ex-husbands and a lottery ticket? Still more likely to win the damn lottery.",
  "Why did the scarecrow win an award? Because he was outstanding in his field — unlike my cousin Dale, who's just out standing in his field, drunk.",
  "How do you know the toothbrush was invented in the backwoods? Anywhere else, they'd have called it a teethbrush.",
  "A pirate walks into a bar with a steering wheel down his pants. Bartender says 'what's with the wheel?' Pirate says 'Arr, it's drivin' me nuts!'",
  "My mama says I got my looks from my daddy. All these years later and the poor bastard still wants 'em back.",
  "Why don't hillbillies do reverse cowgirl? You never turn your back on family. …I'll see myself to the creek.",
  "What's the difference between a lady's purse and a pirate's chest? One of 'em's got gold in it, the other's got three lipsticks, a flask, and evidence.",
  "You might be a redneck if you've ever mowed the yard and found a car you forgot you owned.",
  "Why did the pirate go to the Apple store? He heard they had eye patches. He left with an iPhone and a court date.",
  "A man tells his wife, 'You're not aging, you're marinating.' She hit him with the cast iron — the good one, not the cheap shit.",
  "What do hillbillies call a fancy dinner? Anything you can't eat with the same hand you're drivin' with.",
  "Why are pirates such bad singers? They keep hittin' the high seas and missin' every other damn note.",
  "My dating life is like my truck: old, loud, leaks everywhere, and still somehow the best ride in the county.",
];

const GREET_KEY = "tmack48-mbn-greet";
const GREETING = "What's up, Taylor — welcome to your admin control center.";

export default function MrBigNutsWidget() {
  const [view, setView] = useState<"open" | "min" | "closed">("min");
  const [talk, setTalk] = useState(true);
  const [personaId, setPersonaId] = useState("hillbilly");
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [showDevForm, setShowDevForm] = useState(false);
  const [devRequest, setDevRequest] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Mr Big Nuts, control-room edition. I pick songs, I tell jokes every two minutes, and I do not sugarcoat a damn thing. Pick my voice up top — hillbilly, pirate, or the lady.",
    },
  ]);
  const persona = useMemo(
    () => PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0],
    [personaId]
  );
  const talkRef = useRef(talk);
  talkRef.current = talk;
  const personaRef = useRef(persona);
  personaRef.current = persona;
  const jokeIdx = useRef(Math.floor(Math.random() * JOKES.length));
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const say = (text: string) => {
    if (talkRef.current) speak(text, personaRef.current.voice);
  };

  const post = (text: string, speakIt = true) => {
    setMsgs((m) => [...m, { role: "bot", text }]);
    if (speakIt) say(text);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, view]);

  /* Login greeting — Admin.tsx plants the flag the moment Taylor logs in. */
  useEffect(() => {
    if (sessionStorage.getItem(GREET_KEY) !== "1") return;
    sessionStorage.removeItem(GREET_KEY);
    setView("open");
    const t = window.setTimeout(() => {
      post(`${GREETING} ${personaRef.current.chatter[0]}`, true);
    }, 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* A random joke every two minutes — posted AND spoken. */
  useEffect(() => {
    const id = window.setInterval(() => {
      const p = personaRef.current;
      const intro = p.jokeIntro[Math.floor(Math.random() * p.jokeIntro.length)];
      jokeIdx.current = (jokeIdx.current + 1 + Math.floor(Math.random() * 5)) % JOKES.length;
      post(`${intro} ${JOKES[jokeIdx.current]}`, true);
    }, 120000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (forcedText?: string) => {
    const text = (forcedText ?? draft).trim();
    if (!text) return;
    setDraft("");
    if (/\bjoke\b/i.test(text)) {
      jokeIdx.current = (jokeIdx.current + 1) % JOKES.length;
      const intro = persona.jokeIntro[Math.floor(Math.random() * persona.jokeIntro.length)];
      setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: `${intro} ${JOKES[jokeIdx.current]}` }]);
      say(`${intro} ${JOKES[jokeIdx.current]}`);
      return;
    }
    const answer = answerQuestion(text);
    const flavor = persona.chatter[Math.floor(Math.random() * persona.chatter.length)];
    const botText = answer.play
      ? `${answer.text} Watch it here: ${answer.play.watchUrl}`
      : `${answer.text} ${Math.random() < 0.35 ? flavor : ""}`.trim();
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: botText }]);
    say(botText);
  };

  const openDevRequest = () => {
    const subject = encodeURIComponent("TMACK48 Dev Request");
    const body = encodeURIComponent(
      devRequest.trim() || "Please update this part of the TMACK48 website:\n\n- "
    );
    window.location.href = `mailto:mr.jwswain@gmail.com?subject=${subject}&body=${body}`;
    const confirm = "Request fired off to your brother at 3000 Studios. Consider the shit handled.";
    setMsgs((m) => [...m, { role: "bot", text: confirm }]);
    say(confirm);
    setShowDevForm(false);
    setDevRequest("");
  };

  const sessionRef = useRef<ReturnType<typeof startListeningSession>>(null);

  // Deliberately NOT async: no await may intervene between the tap and
  // startListeningSession — it invokes getUserMedia and calls
  // recognition.start() synchronously, inside this handler's call stack.
  const mic = () => {
    if (listening) {
      sessionRef.current?.stop();
      return;
    }
    if (!recognitionSupported()) {
      setMicStatus("unsupported");
      // Still exercise the permission + device-detection path — never silent.
      void diagnoseMic();
      post("This browser can't hear worth a damn — Chrome can. Type it and I'll still talk back.", false);
      return;
    }
    setListening(true);
    setMicStatus("listening");
    const session = startListeningSession({
      onInterim: (t) => setDraft(t),
      onText: (t) => {
        setDraft("");
        send(t);
      },
      onError: (message, status) => {
        if (status) setMicStatus(status);
        post(message, false);
      },
      onEnd: () => {
        sessionRef.current = null;
        setListening(false);
        // Clear back to idle — unless an error status just landed.
        setMicStatus((s) => (s === "listening" ? "idle" : s));
      },
    });
    if (session) {
      sessionRef.current = session;
    } else {
      setListening(false);
      setMicStatus("unsupported");
      post(MIC_UNSUPPORTED_MESSAGE, false);
    }
  };

  if (view === "closed") return null;

  if (view === "min") {
    return (
      <aside className="fixed bottom-28 right-4 z-[56]">
        <p className="mb-2 text-right text-xs uppercase tracking-[0.18em] text-gold-200/90">Mr Big Nuts</p>
        <button
          type="button"
          onClick={() => setView("open")}
          className="ml-auto flex items-center gap-2 rounded-full border border-gold-300/40 bg-black/85 px-3 py-2 text-sm text-platinum shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
        >
          <span className="animate-bounce text-xl">🐿️</span>
          <span>Chat with Mr Big Nuts</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="fixed bottom-28 right-4 z-[56] flex max-h-[min(640px,calc(100dvh-8rem))] w-[min(92vw,350px)] flex-col max-sm:bottom-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:left-[max(0.75rem,env(safe-area-inset-left))] max-sm:right-[max(0.75rem,env(safe-area-inset-right))] max-sm:top-[max(0.75rem,env(safe-area-inset-top))] max-sm:max-h-none max-sm:w-auto">
      <p className="mb-2 shrink-0 text-right text-xs uppercase tracking-[0.18em] text-gold-200/90">Mr Big Nuts</p>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gold-300/45 bg-[#050505] shadow-[0_14px_45px_rgba(0,0,0,0.72)]">
        {/* Header: persona picker, voice toggle, minimize, close */}
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2.5">
          <select
            value={personaId}
            onChange={(e) => {
              setPersonaId(e.target.value);
              const p = PERSONAS.find((x) => x.id === e.target.value) ?? PERSONAS[0];
              post(p.chatter[Math.floor(Math.random() * p.chatter.length)], true);
            }}
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#111111] px-2 py-1.5 text-xs font-semibold text-gold-100 outline-none focus:border-gold-300/60"
            aria-label="Pick Mr Big Nuts' voice"
          >
            {PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-1.5" title="Voice on/off">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-platinum/60">Talk</span>
            <button
              type="button"
              role="switch"
              aria-checked={talk}
              aria-label="Toggle Mr Big Nuts voice"
              onClick={() => {
                setTalk((v) => {
                  if (v) stopSpeaking();
                  return !v;
                });
              }}
              className={`relative h-5 w-10 shrink-0 rounded-full transition-colors ${talk ? "bg-gold-300" : "bg-white/20"}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${talk ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </label>
          <button
            type="button"
            onClick={() => setView("min")}
            className="rounded-lg border border-white/15 px-2 py-1 text-sm leading-none text-platinum/80 hover:border-gold-300/50 hover:text-gold-200"
            aria-label="Minimize chat"
            title="Minimize — jokes keep coming every 2 minutes"
          >
            –
          </button>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setView("closed");
            }}
            className="rounded-lg border border-white/15 px-2 py-1 text-sm leading-none text-platinum/80 hover:border-red-300/60 hover:text-red-200"
            aria-label="Close chat"
            title="Close him out completely"
          >
            ✕
          </button>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {msgs.map((m, i) => (
            <p
              key={i}
              className={`break-words rounded-xl px-3 py-2 text-sm leading-relaxed ${
                m.role === "bot" ? "bg-gold-300/12 text-gold-100" : "bg-[#161616] text-platinum"
              }`}
            >
              {m.text}
            </p>
          ))}
        </div>

        {showDevForm && (
          <div className="shrink-0 space-y-2 border-t border-white/10 p-3">
            <label className="block text-[10px] uppercase tracking-[0.16em] text-platinum/60">
              Note for your brother
            </label>
            <textarea
              value={devRequest}
              onChange={(e) => setDevRequest(e.target.value)}
              rows={3}
              placeholder="Describe what needs fixing…"
              className="w-full rounded-lg border border-white/15 bg-[#111111] px-3 py-2 text-sm text-platinum outline-none focus:border-gold-300/60"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDevForm(false)}
                className="rounded-lg border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.16em] text-platinum/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={openDevRequest}
                className="rounded-lg bg-gold-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-950"
              >
                Send it
              </button>
            </div>
          </div>
        )}

        {/* Mic status line — persistent live region directly above the input row */}
        <p
          role="status"
          aria-live="polite"
          className={
            micStatus === "idle"
              ? "sr-only"
              : `shrink-0 px-3 pt-2 text-[11px] font-semibold ${
                  micStatus === "listening" || micStatus === "unsupported" ? "text-gold-200" : "text-red-200"
                }`
          }
        >
          {MIC_STATUS_COPY[micStatus]}
        </p>

        <div className="flex shrink-0 gap-2 border-t border-white/10 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ask for a song… or say 'joke'"
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#111111] px-3 py-2 text-sm text-platinum outline-none focus:border-gold-300/60"
          />
          <button
            type="button"
            onClick={() => void mic()}
            className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold ${
              listening
                ? "border-red-300/70 bg-red-500/20 text-red-100"
                : "border-gold-300/40 bg-black text-gold-200"
            }`}
            aria-label="Talk (microphone)"
            title="Tap and talk — your browser will ask for the mic"
          >
            {listening ? "●" : "🎤"}
          </button>
          <button
            type="button"
            onClick={() => send()}
            disabled={!draft.trim()}
            className="shrink-0 rounded-lg bg-gold-300 px-3 py-2 text-sm font-semibold text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
          <button
            type="button"
            onClick={() => setShowDevForm((v) => !v)}
            className="shrink-0 rounded-lg border border-gold-300/40 bg-black px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold-200"
          >
            Dev
          </button>
        </div>
        <div className="shrink-0 border-t border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-platinum/50">
          Jokes every 2 minutes · Voice uses your browser audio · Channel: {siteConfig.channel.handle}
        </div>
      </div>
    </aside>
  );
}
