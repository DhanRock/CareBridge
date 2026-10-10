
import { useEffect, useRef, useState } from "react";
import "./App.css";

const knownHeadings = [
  "SIMPLE EXPLANATION",
  "IMPORTANT INSTRUCTIONS",
  "MEDICAL TERMS",
  "QUESTIONS TO ASK A HEALTHCARE PROFESSIONAL",
  "STEPS TO TAKE",
  "WHAT THIS MEANS",
  "KEY TAKEAWAYS",
  "SUMMARY",
  "WHAT TO REMEMBER",
  "WHEN TO GET HELP",
  "NEXT STEPS",
  "IMPORTANT WARNINGS",
];

function formatSections(answer: string) {
  const cleaned = answer.replace(/\r/g, "").trim();

  const headingPattern = new RegExp(
    "^\\s*(?:" +
      knownHeadings
        .map((heading) =>
          heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        )
        .join("|") +
      ")\\s*:?\\s*$",
    "gim"
  );

  const matches = [...cleaned.matchAll(headingPattern)];

  if (matches.length === 0) {
    return [{ title: "Explanation", content: cleaned }];
  }

  const sections = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length
        ? matches[index + 1].index ?? cleaned.length
        : cleaned.length;

    return {
      title: match[0].trim().replace(/:$/, ""),
      content: cleaned.slice(start, end).trim(),
    };
  });

  const intro = cleaned.slice(0, matches[0].index).trim();

  if (intro) {
    sections.unshift({ title: "Overview", content: intro });
  }

  return sections.filter((section) => section.content.length > 0);
}

function App() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("simplify");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textSize, setTextSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  function stopSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
  }

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function readAloud() {
    if (!result.trim()) return;

    if (!("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported by this browser.");
      return;
    }

    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(result);
    utterance.lang = "en-US";
    utterance.rate = 0.9;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;

      if (event.error !== "canceled" && event.error !== "interrupted") {
        setError("Speech playback failed. Please try again.");
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function togglePause() {
    if (!("speechSynthesis" in window)) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }

  async function simplifyText() {
    if (!text.trim()) {
      setError(
        mode === "simplify"
          ? "Please paste some healthcare information first."
          : "Please enter a healthcare question first."
      );
      return;
    }

    stopSpeech();
    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    try {
      const response = await fetch("http://127.0.0.1:8000/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult(data.result);
    } catch {
      setError("Could not connect. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch {
      setError("Copying didn't work. Please copy the answer manually.");
    }
  }

  function changeMode(nextMode: string) {
    stopSpeech();
    setMode(nextMode);
    setResult("");
    setError("");
    setCopied(false);
  }

  const sections = result ? formatSections(result) : [];

  return (
    <div
  className={`app ${highContrast ? "high-contrast" : ""}`}
  style={{ "--reading-size": `${textSize}px` } as React.CSSProperties}
>
      <header className="hero">
        <div className="logo">CB</div>
        <p className="eyebrow">HEALTHCARE, MADE CLEARER</p>
        <h1>Understand your healthcare information.</h1>
        <p className="subtitle">
          Turn complicated healthcare language into clear,
          simple explanations you can understand.
        </p>
      </header>

      <main>
        <section className="accessibility-toolbar" aria-label="Accessibility settings">
  <strong>Reading settings</strong>

  <div className="accessibility-controls">
    <button
      type="button"
      className="accessibility-button"
      onClick={() => setTextSize((size) => Math.max(14, size - 2))}
      disabled={textSize <= 14}
      aria-label="Decrease reading text size"
    >
      A−
    </button>

    <span className="text-size-label">{textSize}px</span>

    <button
      type="button"
      className="accessibility-button"
      onClick={() => setTextSize((size) => Math.min(24, size + 2))}
      disabled={textSize >= 24}
      aria-label="Increase reading text size"
    >
      A+
    </button>

    <button
      type="button"
      className={`accessibility-button ${highContrast ? "selected" : ""}`}
      aria-pressed={highContrast}
      onClick={() => setHighContrast((enabled) => !enabled)}
    >
      {highContrast ? "High Contrast On" : "High Contrast"}
    </button>

    <button
      type="button"
      className="accessibility-button"
      onClick={() => {
        setTextSize(16);
        setHighContrast(false);
      }}
    >
      Reset
    </button>
  </div>
</section>
        <section className="card">
          <div className="mode-selector">
            <button
              className={mode === "simplify" ? "mode-button active" : "mode-button"}
              onClick={() => changeMode("simplify")}
              type="button"
            >
              Simplify Text
            </button>

            <button
              className={mode === "question" ? "mode-button active" : "mode-button"}
              onClick={() => changeMode("question")}
              type="button"
            >
              Ask a Question
            </button>
          </div>

          <label htmlFor="health-text">
            {mode === "simplify"
              ? "Healthcare information"
              : "Your healthcare question"}
          </label>

          <p className="hint">
            {mode === "simplify"
              ? "Paste sample or non-private healthcare text below."
              : "Ask a general healthcare question in your own words."}
          </p>

          <textarea
            id="health-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              mode === "simplify"
                ? "Paste healthcare information here..."
                : "Example: What is hypertension?"
            }
          />

          <div className="actions">
            <button onClick={simplifyText} disabled={loading}>
              {loading
                ? "Working..."
                : mode === "simplify"
                  ? "Simplify information →"
                  : "Answer my question →"}
            </button>

            <button
              className="clear"
              type="button"
              onClick={() => {
                stopSpeech();
                setText("");
                setResult("");
                setError("");
                setCopied(false);
              }}
            >
              Clear
            </button>
          </div>

          {loading && (
            <p className="hint">Preparing your explanation. This may take a little while...</p>
          )}

          {error && <p className="error">{error}</p>}
        </section>

        {result && (
          <section className="answer-area">
            <div className="answer-header">
              <div>
                <p className="eyebrow">YOUR RESULTS</p>
                <h2>
                  {mode === "simplify"
                    ? "Here's the clearer version."
                    : "Here's what you should know."}
                </h2>
                <p className="hint">
                  Written to make healthcare information easier to understand.
                </p>
              </div>

              <button className="copy-button" onClick={copyAnswer}>
                {copied ? "Copied ✓" : "Copy answer"}
              </button>
            </div>

            <div className="speech-controls">
              <button
                className="speech-button"
                onClick={readAloud}
                disabled={isSpeaking && !isPaused}
              >
                <span aria-hidden="true">🔊</span>{" "}
                {isSpeaking && !isPaused ? "Reading aloud..." : "Read Aloud"}
              </button>

              <button
                className="speech-secondary"
                onClick={togglePause}
                disabled={!isSpeaking}
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>

              <button
                className="speech-secondary"
                onClick={stopSpeech}
                disabled={!isSpeaking}
              >
                ■ Stop
              </button>
            </div>

            <div className="answer-sections">
              {sections.map((section, index) => (
                <article
                  className="answer-section"
                  key={`${section.title}-${index}`}
                >
                  <div className="section-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="section-content">
                    <h3>
                      {section.title
                        .toLowerCase()
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </h3>
                    <p>{section.content}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="safety-note">
              <div className="safety-icon">i</div>
              <div>
                <strong>Important reminder</strong>
                <p>
                  CareBridge provides educational information, not a diagnosis
                  or a substitute for professional medical advice. AI can make
                  mistakes. Confirm medical instructions with a qualified
                  healthcare professional.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>
        <strong>CareBridge</strong>
        <p>Making healthcare information easier to understand.</p>
      </footer>
    </div>
  );
}

export default App;
