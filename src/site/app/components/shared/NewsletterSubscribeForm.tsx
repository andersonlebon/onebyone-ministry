"use client";

import { useState, useTransition } from "react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

type Props = {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  layout?: "stack" | "inline";
  showFirstName?: boolean;
};

export default function NewsletterSubscribeForm({
  className = "",
  inputClassName = "",
  buttonClassName = "",
  layout = "stack",
  showFirstName = false,
}: Props) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await subscribeToNewsletter({
        email,
        firstName: showFirstName ? firstName : undefined,
        company: "",
      });

      if (result.ok) {
        setMessage(result.message);
        setEmail("");
        setFirstName("");
      } else {
        setError(result.message);
      }
    });
  };

  if (message) {
    return <p className={`text-sm text-[#6E9277] ${className}`}>{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={layout === "inline" ? "flex gap-2" : "flex flex-col gap-2"}>
        {showFirstName && (
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className={inputClassName}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          className={inputClassName}
        />
        <button type="submit" disabled={pending} className={buttonClassName}>
          {pending ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </form>
  );
}
