"use client";

import { useState } from "react";
import Link from "next/link";
import { useColors } from "../../../lib/themeStore";
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, Heart } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import NewsletterSubscribeForm from "../shared/NewsletterSubscribeForm";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Photos", to: "/photos" },
  { label: "Videos", to: "/videos" },
  { label: "Stories", to: "/stories" },
  { label: "Donate", to: "/donate" },
  { label: "Contact", to: "/contact" },
];

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function Footer() {
  const c = useColors();
  const { brandAssets } = useSiteMedia();
  const { settings } = useSiteContent();

  const email = settings.contactEmail || siteConfig.email;
  const phone = settings.contactPhone;
  const socials = [
    { href: settings.facebookUrl, icon: Facebook, label: "Facebook" },
    { href: settings.instagramUrl, icon: Instagram, label: "Instagram" },
    { href: settings.youtubeUrl, icon: Youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer style={{ backgroundColor: c.footer }} className="text-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <img
              src={brandAssets.logoWhite}
              alt="One By One Ministries"
              className="h-24 w-auto object-contain mb-4"
            />
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              {settings.missionStatement}
            </p>
            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded flex items-center justify-center bg-white/10 hover:bg-[#6E9277] transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-5" style={{ fontFamily: "'Francois One', sans-serif" }}>
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    href={link.to}
                    className="text-white/65 hover:text-[#EAC79A] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-5" style={{ fontFamily: "'Francois One', sans-serif" }}>
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-white/65 text-sm">
                <MapPin size={15} className="text-[#6E9277] mt-0.5 flex-shrink-0" />
                <span>{siteConfig.location}</span>
              </li>
              <li className="flex gap-3 text-white/65 text-sm">
                <Mail size={15} className="text-[#6E9277] mt-0.5 flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-[#EAC79A] transition-colors">
                  {email}
                </a>
              </li>
              {phone && (
                <li className="flex gap-3 text-white/65 text-sm">
                  <Phone size={15} className="text-[#6E9277] mt-0.5 flex-shrink-0" />
                  <a href={phoneHref(phone)} className="hover:text-[#EAC79A] transition-colors">
                    {phone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-5" style={{ fontFamily: "'Francois One', sans-serif" }}>
              Stay Connected
            </h4>
            <p className="text-white/65 text-sm mb-4 leading-relaxed">
              Receive ministry updates, stories, and prayer requests directly to your inbox.
            </p>
            <NewsletterSubscribeForm
              inputClassName="px-3 py-2 rounded text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#6E9277] transition-colors"
              buttonClassName="py-2 rounded text-sm font-semibold text-white transition-colors bg-[#6E9277] hover:bg-[#5a7d64]"
            />
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs">
          <p>© {new Date().getFullYear()} One By One Ministries Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={11} className="text-[#EAC79A]" /> for the Kingdom
          </p>
        </div>
      </div>
    </footer>
  );
}
