"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitExpertQuestionAction } from "@/app/actions/askExpert";

const STORAGE_KEY = "fgintel:askExpertQuestions";
const MAX_TRACKED = 20;

type TrackedQuestion = { id: string; question: string; submittedAt: number };

type AnswerStatus = "PENDING" | "FULFILLED" | "FAILED";

type QuestionRecord = {
  id: string;
  question: string;
  status: AnswerStatus;
  answer: string | null;
  answerFormat: "PARAGRAPH" | "BULLETS" | null;
  sources: string | null;
  note: string | null;
  requestedAt: string;
};

function loadTracked(): TrackedQuestion[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrackedQuestion[]) : [];
  } catch {
    return [];
  }
}

function saveTracked(list: TrackedQuestion[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_TRACKED)));
  } catch {
    // ignore — not critical if this doesn't persist
  }
}

function AnswerBody({ record }: { record: QuestionRecord }) {
  if (record.status === "PENDING") {
    return <p className="text-xs text-muted">Still researching — check back in a bit (usually within about an hour).</p>;
  }
  if (record.status === "FAILED") {
    return (
      <p className="text-xs text-muted">
        Couldn&apos;t find reliable information on this one{record.note ? ` (${record.note})` : ""} — try rephrasing
        or asking something else.
      </p>
    );
  }

  let sources: { name: string; url: string }[] = [];
  try {
    sources = record.sources ? JSON.parse(record.sources) : [];
  } catch {
    sources = [];
  }

  return (
    <div className="flex flex-col gap-2">
      {record.answerFormat === "BULLETS" ? (
        <ul className="flex flex-col gap-1.5">
          {(() => {
            try {
              return (JSON.parse(record.answer ?? "[]") as string[]).map((b, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="mt-0.5 text-accent">▸</span>
                  <span>{b}</span>
                </li>
              ));
            } catch {
              return null;
            }
          })()}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-foreground">{record.answer}</p>
      )}
      {sources.length > 0 && (
        <div className="flex flex-col gap-0.5 border-t border-black/10 pt-1.5">
          {sources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] text-accent hover:text-accent-strong hover:underline"
            >
              {s.name} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Unlike MilitaryFunFacts (read-only, safe to duplicate for a mobile/desktop
// pair), this panel holds real interactive state (a form + a ref), so it's
// rendered exactly once — a single responsive card rather than two DOM
// copies toggled by CSS, which would otherwise split the form ref and risk
// double submission.
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 w-full rounded border border-accent/40 bg-panel p-4 lg:mb-0 lg:w-64 lg:shrink-0">
      <p className="stencil mb-3 text-sm tracking-widest text-accent-strong">
        Curious about something? I can provide an answer for you.
      </p>
      {children}
    </div>
  );
}

export function AskExpertBox() {
  const [state, formAction, pending] = useActionState(submitExpertQuestionAction, undefined);
  const [tracked, setTracked] = useState<TrackedQuestion[]>([]);
  const [records, setRecords] = useState<Record<string, QuestionRecord>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function refresh(ids: string[]) {
    if (ids.length === 0) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/ask-expert?ids=${ids.join(",")}`);
      if (!res.ok) return;
      const data = (await res.json()) as { questions: QuestionRecord[] };
      setRecords((prev) => {
        const next = { ...prev };
        for (const q of data.questions) next[q.id] = q;
        return next;
      });
    } catch {
      // ignore — will retry on next manual/auto refresh
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const list = loadTracked();
    setTracked(list);
    refresh(list.map((t) => t.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hasPending = tracked.some((t) => (records[t.id]?.status ?? "PENDING") === "PENDING");
    if (!hasPending) return;
    const interval = setInterval(() => refresh(tracked.map((t) => t.id)), 45000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracked, records]);

  useEffect(() => {
    if (state?.ok && state.id) {
      const next = [{ id: state.id, question: questionText, submittedAt: Date.now() }, ...tracked].slice(
        0,
        MAX_TRACKED
      );
      setTracked(next);
      saveTracked(next);
      refresh([state.id]);
      setQuestionText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function dismiss(id: string) {
    const next = tracked.filter((t) => t.id !== id);
    setTracked(next);
    saveTracked(next);
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted">
          Ask about military affairs, defence developments, or geopolitics — a research analyst will look into it
          and reply grounded in reliable, reputable sources. Answers usually appear within about an hour.
        </p>

        <form ref={formRef} action={formAction} className="flex flex-col gap-2">
          <textarea
            name="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            rows={3}
            placeholder='e.g. "How does the F-35B differ operationally from the F-35A?"'
            className="rounded border border-border bg-panel-2 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
          {state?.error && <p className="font-mono text-xs text-danger">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="stencil self-start rounded bg-accent px-4 py-2 text-xs font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Ask"}
          </button>
        </form>

        {tracked.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Your questions</span>
              <button
                type="button"
                onClick={() => refresh(tracked.map((t) => t.id))}
                disabled={refreshing}
                className="font-mono text-[10px] text-accent hover:text-accent-strong hover:underline disabled:opacity-50"
              >
                {refreshing ? "Checking…" : "Refresh"}
              </button>
            </div>
            {tracked.map((t) => {
              const record = records[t.id];
              return (
                <div key={t.id} className="flex flex-col gap-1 border-l border-border pl-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">{t.question}</p>
                    <button
                      type="button"
                      onClick={() => dismiss(t.id)}
                      aria-label="Dismiss"
                      className="shrink-0 text-muted hover:text-danger"
                    >
                      ✕
                    </button>
                  </div>
                  {record ? <AnswerBody record={record} /> : <p className="text-xs text-muted">Loading…</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Panel>
  );
}
