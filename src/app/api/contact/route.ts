import { NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const honeypot = normalize(formData.get("company"));

  if (honeypot) {
    return NextResponse.json({ message: "Thank you. Your message has been received." });
  }

  const payload = {
    name: normalize(formData.get("name")),
    email: normalize(formData.get("email")),
    interest: normalize(formData.get("interest")),
    message: normalize(formData.get("message"))
  };

  if (payload.name.length < 2 || !emailPattern.test(payload.email) || payload.message.length < 10) {
    return NextResponse.json({ message: "Please provide a valid name, email, and message." }, { status: 400 });
  }

  const webhookUrl = process.env.CONTACT_FORM_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      {
        message:
          "Form delivery is not configured yet. Please email hello@onebyoneministries.org while the site is being prepared for launch."
      },
      { status: 503 }
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, source: "website-contact-form", submittedAt: new Date().toISOString() })
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "We could not send your message right now. Please try again or email the ministry directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ message: "Thank you. Your message has been received." });
}
