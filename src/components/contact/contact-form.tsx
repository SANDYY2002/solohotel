"use client";

import * as React from "react";
import {
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MessageSquare,
  Compass,
  ArrowRight,
} from "lucide-react";

const SUBJECTS = [
  "General inquiry",
  "Reservations",
  "Dining",
  "Spa & wellness",
  "Events & weddings",
  "Press",
] as const;

type Subject = (typeof SUBJECTS)[number];

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: Subject;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;
type Touched = Partial<Record<keyof FormState, boolean>>;
type Status = "idle" | "sending" | "sent";

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: SUBJECTS[0],
  message: "",
};

export function ContactForm() {
  const [form, setForm] = React.useState<FormState>(initialState);
  const [status, setStatus] = React.useState<Status>("idle");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Touched>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function blur(key: keyof FormState) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email.";
    if (!form.message.trim()) next.message = "Write a message before sending.";
    setErrors(next);
    setTouched({ name: true, email: true, message: true });
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("sending");
    try {
      // Replace with a real endpoint, e.g.:
      // const res = await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // if (!res.ok) throw new Error();
      await new Promise((resolve) => setTimeout(resolve, 1100));
      setStatus("sent");
    } catch {
      setStatus("idle");
      setErrors({ message: "Couldn't send that. Try again." });
    }
  }

  return (
    <div className="cf-root">
      <style>{`
        .cf-root {
          --ink: #132420;
          --ink-soft: #1C332D;
          --parchment: #F4EEDE;
          --brass: #A97C34;
          --brass-light: #C9A362;
          --clay: #8C4A3A;
          --moss: #4C6B58;
          --charcoal: #201D18;
          --mist: #C9C2AC;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .cf-root * { box-sizing: border-box; }
        .cf-serif {
          font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
        }
        .cf-mono {
          font-family: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
        }
        .cf-shell {
          display: grid;
          grid-template-columns: 1fr;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 20px 60px -25px rgba(19, 36, 32, 0.45);
          border: 1px solid rgba(19, 36, 32, 0.08);
        }
        @media (min-width: 860px) {
          .cf-shell { grid-template-columns: 0.85fr 1.15fr; }
        }
        .cf-panel {
          background: var(--ink);
          color: var(--parchment);
          padding: 2.75rem 2.25rem;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 2.5rem;
        }
        .cf-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 15% 10%, rgba(169, 124, 52, 0.16), transparent 45%),
            radial-gradient(circle at 90% 85%, rgba(169, 124, 52, 0.10), transparent 40%);
          pointer-events: none;
        }
        .cf-eyebrow {
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--brass-light);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cf-eyebrow .cf-rule {
          width: 22px;
          height: 1px;
          background: var(--brass-light);
          opacity: 0.6;
        }
        .cf-heading {
          font-size: clamp(1.9rem, 3.4vw, 2.5rem);
          line-height: 1.12;
          font-weight: 600;
          margin: 0.9rem 0 0.9rem;
          position: relative;
          z-index: 1;
        }
        .cf-heading em {
          color: var(--brass-light);
          font-style: italic;
        }
        .cf-sub {
          font-size: 0.95rem;
          line-height: 1.65;
          color: rgba(244, 238, 222, 0.72);
          max-width: 30ch;
          position: relative;
          z-index: 1;
        }
        .cf-channels {
          border-top: 1px solid rgba(244, 238, 222, 0.14);
          padding-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.05rem;
          position: relative;
          z-index: 1;
        }
        .cf-channel {
          display: flex;
          align-items: baseline;
          gap: 0.85rem;
          font-size: 0.88rem;
        }
        .cf-channel .cf-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.66rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--mist);
          min-width: 84px;
        }
        .cf-channel .cf-value { color: var(--parchment); }
        .cf-form-side {
          background: var(--parchment);
          padding: 2.75rem 2.25rem;
        }
        .cf-form-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--charcoal);
          margin: 0 0 0.35rem;
        }
        .cf-form-hint {
          font-size: 0.88rem;
          color: rgba(32, 29, 24, 0.58);
          margin: 0 0 2rem;
        }
        .cf-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem 1.5rem;
        }
        @media (min-width: 560px) {
          .cf-grid.cf-grid-2 { grid-template-columns: 1fr 1fr; }
        }
        .cf-field { display: flex; flex-direction: column; gap: 0.5rem; }
        .cf-field-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: rgba(32, 29, 24, 0.55);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .cf-field-label svg { opacity: 0.65; }
        .cf-underline {
          display: flex;
          align-items: center;
          border-bottom: 1.5px solid rgba(32, 29, 24, 0.22);
          padding-bottom: 0.45rem;
          transition: border-color 160ms ease;
        }
        .cf-underline:focus-within { border-color: var(--brass); }
        .cf-underline.cf-err { border-color: var(--clay); }
        .cf-input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 0.98rem;
          color: var(--charcoal);
          font-family: inherit;
        }
        .cf-input::placeholder { color: rgba(32, 29, 24, 0.35); }
        .cf-error {
          font-size: 0.78rem;
          color: var(--clay);
          margin: 0;
        }
        .cf-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
        }
        .cf-pill {
          border: 1.5px solid rgba(32, 29, 24, 0.18);
          background: transparent;
          color: var(--charcoal);
          padding: 0.5rem 0.95rem;
          border-radius: 999px;
          font-size: 0.83rem;
          cursor: pointer;
          transition: all 140ms ease;
          font-family: inherit;
        }
        .cf-pill:hover { border-color: var(--brass); }
        .cf-pill.cf-pill-active {
          background: var(--ink);
          border-color: var(--ink);
          color: var(--parchment);
        }
        .cf-textarea {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          resize: none;
          font-size: 0.98rem;
          color: var(--charcoal);
          font-family: inherit;
          line-height: 1.6;
        }
        .cf-textarea::placeholder { color: rgba(32, 29, 24, 0.35); }
        .cf-count {
          text-align: right;
          font-size: 0.72rem;
          color: rgba(32, 29, 24, 0.4);
          font-family: 'IBM Plex Mono', monospace;
        }
        .cf-submit {
          margin-top: 0.75rem;
          width: 100%;
          height: 3.1rem;
          border-radius: 12px;
          border: none;
          background: var(--brass);
          color: var(--ink);
          font-size: 0.98rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          cursor: pointer;
          transition: background 140ms ease, transform 80ms ease;
          font-family: inherit;
        }
        .cf-submit:hover:not(:disabled) { background: var(--brass-light); }
        .cf-submit:active:not(:disabled) { transform: scale(0.99); }
        .cf-submit:disabled { opacity: 0.75; cursor: default; }
        .cf-submit:focus-visible, .cf-pill:focus-visible, .cf-input:focus-visible {
          outline: 2px solid var(--brass);
          outline-offset: 2px;
        }
        .cf-spin { animation: cf-spin 0.8s linear infinite; }
        @keyframes cf-spin { to { transform: rotate(360deg); } }
        .cf-success {
          padding: 3.5rem 2.25rem;
          text-align: center;
          animation: cf-fade 420ms ease both;
        }
        @keyframes cf-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cf-success-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 1.1rem;
          color: var(--moss);
        }
        .cf-success-title {
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--charcoal);
          margin: 0 0 0.6rem;
        }
        .cf-success-body {
          font-size: 0.95rem;
          color: rgba(32, 29, 24, 0.65);
          margin: 0 auto 1.75rem;
          max-width: 34ch;
          line-height: 1.6;
        }
        .cf-again {
          border: 1.5px solid rgba(32, 29, 24, 0.22);
          background: transparent;
          color: var(--charcoal);
          padding: 0.65rem 1.3rem;
          border-radius: 10px;
          font-size: 0.88rem;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 140ms ease;
        }
        .cf-again:hover { border-color: var(--brass); }
        @media (prefers-reduced-motion: reduce) {
          .cf-submit, .cf-underline, .cf-pill, .cf-again, .cf-spin, .cf-success {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="cf-shell">
        <div className="cf-panel">
          <div>
            <div className="cf-eyebrow">
              <span className="cf-rule" />
              Get in touch
            </div>
            <h2 className="cf-heading cf-serif">
              We read every <em>message</em> ourselves.
            </h2>
            <p className="cf-sub">
              Tell us what you need and a member of our team will follow up
              within one business day.
            </p>
          </div>

          <div className="cf-channels">
            <div className="cf-channel">
              <span className="cf-label cf-mono">Email</span>
              <span className="cf-value">hello@yourbrand.com</span>
            </div>
            <div className="cf-channel">
              <span className="cf-label cf-mono">Phone</span>
              <span className="cf-value">+1 (415) 555‑0134</span>
            </div>
            <div className="cf-channel">
              <span className="cf-label cf-mono">Hours</span>
              <span className="cf-value">Mon–Sat, 9am–7pm</span>
            </div>
          </div>
        </div>

        <div className="cf-form-side">
          {status === "sent" ? (
            <div className="cf-success">
              <CheckCircle2 className="cf-success-icon" strokeWidth={1.5} />
              <h3 className="cf-success-title cf-serif">Message sent</h3>
              <p className="cf-success-body">
                Thanks, {form.name.split(" ")[0] || "there"}. We've got your
                note and will reply within 24 hours.
              </p>
              <button
                className="cf-again"
                onClick={() => {
                  setForm(initialState);
                  setTouched({});
                  setErrors({});
                  setStatus("idle");
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h3 className="cf-form-title cf-serif">Send a message</h3>
              <p className="cf-form-hint">
                Fields marked with an asterisk are required.
              </p>

              <div className="cf-grid cf-grid-2">
                <div className="cf-field">
                  <label className="cf-field-label">
                    <User size={13} />
                    Full name *
                  </label>
                  <div
                    className={`cf-underline ${
                      touched.name && errors.name ? "cf-err" : ""
                    }`}
                  >
                    <input
                      className="cf-input"
                      placeholder="Jordan Reyes"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      onBlur={() => blur("name")}
                    />
                  </div>
                  {touched.name && errors.name && (
                    <p className="cf-error">{errors.name}</p>
                  )}
                </div>

                <div className="cf-field">
                  <label className="cf-field-label">
                    <Mail size={13} />
                    Email *
                  </label>
                  <div
                    className={`cf-underline ${
                      touched.email && errors.email ? "cf-err" : ""
                    }`}
                  >
                    <input
                      className="cf-input"
                      type="email"
                      placeholder="jordan@email.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      onBlur={() => blur("email")}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="cf-error">{errors.email}</p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <div className="cf-field">
                  <label className="cf-field-label">
                    <Phone size={13} />
                    Phone (optional)
                  </label>
                  <div className="cf-underline">
                    <input
                      className="cf-input"
                      placeholder="+1 (555) 000‑0000"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <label
                  className="cf-field-label"
                  style={{ marginBottom: "0.7rem" }}
                >
                  <Compass size={13} />
                  What's this about?
                </label>
                <div className="cf-pills">
                  {SUBJECTS.map((subject) => (
                    <button
                      type="button"
                      key={subject}
                      className={`cf-pill ${
                        form.subject === subject ? "cf-pill-active" : ""
                      }`}
                      onClick={() => update("subject", subject)}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <div className="cf-field">
                  <label className="cf-field-label">
                    <MessageSquare size={13} />
                    Message *
                  </label>
                  <div
                    className={`cf-underline ${
                      touched.message && errors.message ? "cf-err" : ""
                    }`}
                    style={{ alignItems: "flex-start" }}
                  >
                    <textarea
                      className="cf-textarea"
                      rows={4}
                      maxLength={500}
                      placeholder="How can we help?"
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      onBlur={() => blur("message")}
                    />
                  </div>
                  <div className="cf-count">{form.message.length}/500</div>
                  {touched.message && errors.message && (
                    <p className="cf-error" style={{ marginTop: "-0.5rem" }}>
                      {errors.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="cf-submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  <>
                    <Loader2 size={18} className="cf-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}