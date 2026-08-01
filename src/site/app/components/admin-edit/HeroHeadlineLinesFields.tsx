"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  emptyHeroHeadlineLine,
  HERO_HEADLINE_COLOR_LABELS,
  HERO_HEADLINE_COLOR_SWATCHES,
  HERO_HEADLINE_COLORS,
  MAX_HERO_HEADLINE_LINES,
  type HeroHeadlineColor,
  type HeroHeadlineLine,
} from "@/lib/site-content/hero-headline";

type Styles = {
  label: { color: string };
  help: { color: string };
  input: { backgroundColor: string; color: string; borderColor: string };
  border: string;
  text: string;
  muted: string;
  green: string;
  cardBg: string;
};

type Props = {
  lines: HeroHeadlineLine[];
  onChange: (lines: HeroHeadlineLine[]) => void;
  styles: Styles;
};

export function HeroHeadlineLinesFields({ lines, onChange, styles }: Props) {
  const padded =
    lines.length > 0
      ? lines.slice(0, MAX_HERO_HEADLINE_LINES)
      : [emptyHeroHeadlineLine()];

  const updateLine = (index: number, patch: Partial<HeroHeadlineLine>) => {
    const next = padded.map((line, i) => (i === index ? { ...line, ...patch } : line));
    onChange(next);
  };

  const addLine = () => {
    if (padded.length >= MAX_HERO_HEADLINE_LINES) return;
    onChange([...padded, emptyHeroHeadlineLine()]);
  };

  const removeLine = (index: number) => {
    if (padded.length <= 1) {
      onChange([emptyHeroHeadlineLine()]);
      return;
    }
    onChange(padded.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold mb-1" style={styles.label}>
          Headline lines
        </p>
        <p className="text-xs mb-2" style={styles.help}>
          Up to {MAX_HERO_HEADLINE_LINES} sentences. Each line animates on its own row. Default color
          matches the current hero text; pick a brand color per line if you want.
        </p>
      </div>

      {padded.map((line, index) => (
        <div
          key={index}
          className="rounded-xl border p-3 space-y-2.5"
          style={{ borderColor: styles.border, backgroundColor: styles.cardBg }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold" style={{ color: styles.text }}>
              Line {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeLine(index)}
              className="p-1.5 rounded-lg text-red-500"
              title={padded.length <= 1 ? "Clear line" : "Remove line"}
            >
              <Trash2 size={14} />
            </button>
          </div>

          <textarea
            rows={2}
            value={line.text}
            onChange={(e) => updateLine(index, { text: e.target.value })}
            placeholder="One sentence for this line"
            className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none"
            style={styles.input}
          />

          <div>
            <p className="text-[11px] font-semibold mb-1.5" style={styles.help}>
              Color
            </p>
            <div className="flex flex-wrap gap-1.5">
              {HERO_HEADLINE_COLORS.map((color) => {
                const selected = (line.color || "default") === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateLine(index, { color })}
                    title={HERO_HEADLINE_COLOR_LABELS[color]}
                    className="flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold"
                    style={{
                      borderColor: selected ? styles.green : styles.border,
                      color: styles.text,
                      backgroundColor: selected ? "rgba(110,146,119,0.12)" : "transparent",
                    }}
                  >
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-full border"
                      style={{
                        backgroundColor: HERO_HEADLINE_COLOR_SWATCHES[color as HeroHeadlineColor],
                        borderColor: color === "white" || color === "cream" ? styles.border : "transparent",
                      }}
                    />
                    {HERO_HEADLINE_COLOR_LABELS[color]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {padded.length < MAX_HERO_HEADLINE_LINES ? (
        <button
          type="button"
          onClick={addLine}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed py-2 text-xs font-semibold"
          style={{ borderColor: styles.border, color: styles.green }}
        >
          <Plus size={13} /> Add line
        </button>
      ) : null}
    </div>
  );
}
