"use client";

import { useState } from "react";
import Link from "next/link";
import { useColors } from "../../../lib/themeStore";
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, Heart } from "lucide-react";
import { brandAssets } from "@/content/media";

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

export default function Footer() {
  const c = useColors();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer style={{ backgroundColor: c.footer }} className="text-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src={brandAssets.logoWhite}
              alt="One By One Ministries"
              className="h-12 w-auto object-contain mb-4"
            />
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Rebuilding communities through Education, Entrepreneurship, and
              Spiritual Discipleship — one person, one community, one country at
              a time.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded flex items-center justify-center bg-white/10 hover:bg-[#6E9277] transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded flex items-center justify-center bg-white/10 hover:bg-[#6E9277] transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded flex items-center justify-center bg-white/10 hover:bg-[#6E9277] transition-colors"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-5" style={{ fontFamily: "'Francois One', sans-serif" }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
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

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-5" style={{ fontFamily: "'Francois One', sans-serif" }}>
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-white/65 text-sm">
                <MapPin size={15} className="text-[#6E9277] mt-0.5 flex-shrink-0" />
                <span>United States & Democratic Republic of Congo</span>
              </li>
              <li className="flex gap-3 text-white/65 text-sm">
                <Mail size={15} className="text-[#6E9277] mt-0.5 flex-shrink-0" />
                <a href="mailto:info@onebyone.org" className="hover:text-[#EAC79A] transition-colors">
                  info@onebyone.org
                </a>
              </li>
              <li className="flex gap-3 text-white/65 text-sm">
                <Phone size={15} className="text-[#6E9277] mt-0.5 flex-shrink-0" />
                <a href="tel:+15555550100" className="hover:text-[#EAC79A] transition-colors">
                  +1 (555) 555-0100
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-5" style={{ fontFamily: "'Francois One', sans-serif" }}>
              Stay Connected
            </h4>
            <p className="text-white/65 text-sm mb-4 leading-relaxed">
              Receive ministry updates, stories, and prayer requests directly to your inbox.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-[#6E9277] text-sm">
                <Heart size={14} />
                <span>Thank you for joining us!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="px-3 py-2 rounded text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#6E9277] transition-colors"
                />
                <button
                  type="submit"
                  className="py-2 rounded text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: "#6E9277" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a7d64")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6E9277")}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Divider + copyright */}
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
