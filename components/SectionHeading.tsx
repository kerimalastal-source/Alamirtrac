export default function SectionHeading({
  eyebrow,
  title,
  description,
  center,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <span className="text-sm font-bold tracking-wide text-accent">{eyebrow}</span>
      )}
      <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-muted leading-7">{description}</p>}
    </div>
  );
}
