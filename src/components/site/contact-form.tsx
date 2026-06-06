"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to send your message right now.");
      }

      event.currentTarget.reset();
      setStatus("success");
      setMessage(payload.message ?? "Thank you. Your message has been received.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to send your message right now.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-bold text-charcoal">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          className="rounded-2xl border border-charcoal/15 bg-cream/40 px-4 py-3 text-charcoal outline-none transition focus:border-sage focus:bg-white"
          placeholder="Your name"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-bold text-charcoal">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-2xl border border-charcoal/15 bg-cream/40 px-4 py-3 text-charcoal outline-none transition focus:border-sage focus:bg-white"
          placeholder="you@example.com"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="interest" className="text-sm font-bold text-charcoal">
          I want to
        </label>
        <select
          id="interest"
          name="interest"
          className="rounded-2xl border border-charcoal/15 bg-cream/40 px-4 py-3 text-charcoal outline-none transition focus:border-sage focus:bg-white"
          defaultValue="Learn more"
        >
          <option>Learn more</option>
          <option>Volunteer</option>
          <option>Give</option>
          <option>Share a story</option>
          <option>Invite the ministry</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="message" className="text-sm font-bold text-charcoal">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={5}
          className="rounded-2xl border border-charcoal/15 bg-cream/40 px-4 py-3 text-charcoal outline-none transition focus:border-sage focus:bg-white"
          placeholder="Tell us how we can connect with you."
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-sage px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-plum disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Sending..." : "Send message"}
      </button>

      {message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            status === "success" ? "bg-sage/10 text-sage" : "bg-gold/30 text-plum"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
