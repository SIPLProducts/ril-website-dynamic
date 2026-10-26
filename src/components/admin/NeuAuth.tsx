import type { ReactNode, InputHTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/ramky-logo-transparent.png.asset.json";

/** Soft "neumorphic" shell: light grey page, Ramky logo watermark, large round raised card. */
export function NeuShell({ children }: { children: ReactNode }) {
  return (
    <div className="neu-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <img src={logo.url} alt="" aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 w-[min(90vw,900px)] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.07] grayscale" />
      <div className="neu-raised relative flex aspect-square w-full max-w-[540px] items-center justify-center rounded-full p-10 sm:p-16">
        <div className="w-full max-w-[320px]">{children}</div>
      </div>
    </div>
  );
}

export function NeuTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 text-center">
      <h1 className="font-display text-4xl font-extrabold tracking-tight [text-shadow:2px_2px_3px_var(--neu-light)]">{title}</h1>
      <p className="mt-1 text-sm opacity-75">{subtitle}</p>
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; error?: string | undefined };
export function NeuField({ icon, error, type, ...rest }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <div>
      <div className={`neu-inset flex h-12 items-center gap-3 rounded-xl px-4 ${error ? "ring-2 ring-[var(--neu-accent)]/40" : ""}`}>
        <span className={error ? "neu-accent" : "opacity-60"}>{icon}</span>
        <input {...rest} type={isPw && show ? "text" : type} className="h-full w-full bg-transparent text-sm outline-none placeholder:opacity-60" />
        {isPw && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="opacity-60 hover:opacity-100">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && <p className="neu-accent mt-1 pl-1 text-xs">{error}</p>}
    </div>
  );
}

export function NeuButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="neu-raised-sm h-12 w-full rounded-xl text-sm font-bold uppercase tracking-[0.15em] transition active:neu-inset disabled:opacity-60">
      {children}
    </button>
  );
}
