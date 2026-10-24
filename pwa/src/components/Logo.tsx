export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240">
      <rect width="240" height="240" rx="54" fill="#F4B000" />
      <g transform="rotate(-25 120 120)">
        <polygon
          points="20,210 230,120 20,30 20,100 170,120 20,140"
          fill="#0A1F44"
          opacity="0.22"
          transform="translate(16 14)"
        />
        <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" />
      </g>
    </svg>
  );
}

export function Logo({ size = 30, wordmarkClassName = "text-lg" }: { size?: number; wordmarkClassName?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className={`font-extrabold text-white ${wordmarkClassName}`}>
        Ride<span className="text-acc">an</span>
      </span>
    </div>
  );
}
