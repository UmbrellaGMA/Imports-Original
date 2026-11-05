"use client";

type SwitchProps = {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  hint?: string;
};

export function Switch({ checked, label, onChange, disabled, hint }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-left"
    >
      <span className={`relative h-5 w-[34px] shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-accent" : "bg-[#d4d4d0]"}`}>
        <span className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-soft ${checked ? "translate-x-3.5" : ""}`} />
      </span>
      <span>
        <span className="block text-[13px] font-medium leading-tight">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-mute">{hint}</span>}
      </span>
    </button>
  );
}
