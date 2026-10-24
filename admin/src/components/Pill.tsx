const TONE_CLASSES: Record<string, string> = {
  ok: "bg-ok-bg text-ok",
  warn: "bg-warn-bg text-warn",
  info: "bg-info-bg text-info",
  bad: "bg-bad-bg text-bad",
  neutral: "bg-ground text-muted",
  accent: "bg-acc/20 text-navy",
};

export default function Pill({ label, tone }: { label: string; tone: keyof typeof TONE_CLASSES }) {
  return (
    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-bold ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  );
}
