"use client";

import { useEffect, useRef, useState } from "react";

export type VoiceoverSegment = { label: string; text: string };

const RATE_OPTIONS = [0.85, 1, 1.15, 1.25, 1.5];
const RATE_STORAGE_KEY = "fgintel:voiceover-rate";
const VOICE_STORAGE_KEY = "fgintel:voiceover-voice";

// The curated voice choices this app offers — matched against whatever the
// visitor's browser actually reports (these exact "Google ..." voices are
// Chrome/Chromium's own TTS voices; other browsers report different names,
// so each entry only appears if a matching voice is really available).
const PREFERRED_VOICES: { label: string; match: (v: SpeechSynthesisVoice) => boolean }[] = [
  { label: "Google US English", match: (v) => v.name === "Google US English" },
  { label: "Google UK English Female", match: (v) => v.name === "Google UK English Female" },
  { label: "Google UK English Male", match: (v) => v.name === "Google UK English Male" },
  { label: "Mandarin (Chinese)", match: (v) => v.lang.toLowerCase().startsWith("zh") },
];

type Status = "idle" | "playing" | "paused";

/**
 * Reads an article aloud section by section using the browser's built-in
 * text-to-speech (Web Speech API) — free, no API key, works instantly. Runs
 * entirely client-side: nothing is uploaded or generated server-side, so
 * quality depends on the browser/OS's own voices, and playback may pause if
 * the browser tab loses focus or the device screen locks (varies by
 * platform) — a real limitation of this approach versus a generated audio
 * file, traded here for zero cost and zero setup.
 */
export function VoiceoverButton({ segments }: { segments: VoiceoverSegment[] }) {
  const [supported, setSupported] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [voiceURI, setVoiceURI] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const genRef = useRef(0);
  const rateRef = useRef(1);
  const voiceURIRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    let savedVoice: string | null = null;
    try {
      const savedRate = window.localStorage.getItem(RATE_STORAGE_KEY);
      if (savedRate) {
        const parsed = parseFloat(savedRate);
        if (RATE_OPTIONS.includes(parsed)) {
          setRate(parsed);
          rateRef.current = parsed;
        }
      }
      savedVoice = window.localStorage.getItem(VOICE_STORAGE_KEY);
      if (savedVoice) {
        setVoiceURI(savedVoice);
        voiceURIRef.current = savedVoice;
      }
    } catch {
      // localStorage unavailable (private mode etc.) — just use defaults
    }

    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      setVoices(all);
      // Default to "Google US English" when nothing was already saved/chosen.
      if (!savedVoice && !voiceURIRef.current) {
        const usVoice = all.find((v) => v.name === "Google US English");
        if (usVoice) {
          setVoiceURI(usVoice.voiceURI);
          voiceURIRef.current = usVoice.voiceURI;
        }
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  function speakFrom(index: number) {
    const myGen = ++genRef.current;
    window.speechSynthesis.cancel();

    if (index >= segments.length) {
      setStatus("idle");
      setSegmentIndex(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(segments[index].text);
    utterance.rate = rateRef.current;
    const voice = voices.find((v) => v.voiceURI === voiceURIRef.current);
    if (voice) {
      try {
        utterance.voice = voice;
      } catch {
        // fall back to the browser's default voice rather than breaking playback
      }
    }

    utterance.onend = () => {
      if (genRef.current !== myGen) return;
      speakFrom(index + 1);
    };
    utterance.onerror = () => {
      if (genRef.current !== myGen) return;
      setStatus("idle");
    };

    window.speechSynthesis.speak(utterance);
    setSegmentIndex(index);
    setStatus("playing");
  }

  function handlePlayPause() {
    if (!expanded) setExpanded(true);
    if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    } else if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
    } else {
      speakFrom(0);
    }
  }

  function handleStop() {
    genRef.current++;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setSegmentIndex(0);
  }

  function handleSkip(delta: number) {
    const next = Math.min(Math.max(segmentIndex + delta, 0), segments.length - 1);
    speakFrom(next);
  }

  function changeRate(newRate: number) {
    setRate(newRate);
    rateRef.current = newRate;
    try {
      window.localStorage.setItem(RATE_STORAGE_KEY, String(newRate));
    } catch {
      // ignore — not critical if the preference doesn't persist
    }
    if (status === "playing") speakFrom(segmentIndex);
  }

  function changeVoice(newVoiceURI: string) {
    setVoiceURI(newVoiceURI);
    voiceURIRef.current = newVoiceURI;
    try {
      window.localStorage.setItem(VOICE_STORAGE_KEY, newVoiceURI);
    } catch {
      // ignore
    }
    if (status === "playing") speakFrom(segmentIndex);
  }

  if (!supported || segments.length === 0) return null;

  const voiceOptions = PREFERRED_VOICES.map((p) => ({ label: p.label, voice: voices.find(p.match) })).filter(
    (p): p is { label: string; voice: SpeechSynthesisVoice } => Boolean(p.voice)
  );

  const buttonClass =
    "stencil rounded border border-accent px-4 py-2 text-xs tracking-widest text-accent-strong hover:bg-accent hover:text-background transition-colors";

  return (
    <div className="inline-flex flex-col gap-2">
      {!expanded ? (
        <button type="button" onClick={handlePlayPause} className={buttonClass}>
          ▶ Listen
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded border border-accent/40 bg-panel px-3 py-2">
          <button
            type="button"
            onClick={() => handleSkip(-1)}
            disabled={segmentIndex === 0}
            aria-label="Previous section"
            className="rounded border border-border px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent-strong transition-colors disabled:opacity-30"
          >
            ⏮
          </button>
          <button
            type="button"
            onClick={handlePlayPause}
            aria-label={status === "playing" ? "Pause" : "Play"}
            className="rounded border border-accent px-3 py-1 text-xs tracking-widest text-accent-strong hover:bg-accent hover:text-background transition-colors"
          >
            {status === "playing" ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            type="button"
            onClick={() => handleSkip(1)}
            disabled={segmentIndex >= segments.length - 1}
            aria-label="Next section"
            className="rounded border border-border px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent-strong transition-colors disabled:opacity-30"
          >
            ⏭
          </button>
          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop"
            className="rounded border border-border px-2 py-1 text-xs text-muted hover:border-danger hover:text-danger transition-colors"
          >
            ✕
          </button>

          <select
            value={rate}
            onChange={(e) => changeRate(parseFloat(e.target.value))}
            aria-label="Playback speed"
            className="rounded border border-border bg-panel-2 px-1.5 py-1 text-xs text-foreground outline-none focus:border-accent"
          >
            {RATE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>

          {voiceOptions.length > 0 && (
            <select
              value={voiceURI}
              onChange={(e) => changeVoice(e.target.value)}
              aria-label="Voice"
              className="max-w-[10rem] rounded border border-border bg-panel-2 px-1.5 py-1 text-xs text-foreground outline-none focus:border-accent"
            >
              <option value="">Default voice</option>
              {voiceOptions.map(({ label, voice }) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {label}
                </option>
              ))}
            </select>
          )}

          <span className="font-mono text-[10px] text-muted">
            {status === "idle"
              ? "Ready"
              : `${status === "paused" ? "Paused" : "Playing"}: ${segments[segmentIndex]?.label ?? ""}`}
          </span>
        </div>
      )}
    </div>
  );
}
