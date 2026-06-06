type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-sage">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 font-display text-4xl leading-tight text-plum sm:text-5xl lg:text-6xl">{title}</h1>
      {description ? <p className="mt-5 text-lg leading-8 text-charcoal/80">{description}</p> : null}
    </div>
  );
}
