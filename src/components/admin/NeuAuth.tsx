import type { ReactNode, InputHTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff, PanelRightOpen, PanelRightClose } from "lucide-react";
import logo from "@/assets/ramky-logo-transparent.png.asset.json";
import poster from "@/assets/ramky-group-poster.png.asset.json";

/** Poster first (whole image, never cropped); toggle splits into 60% poster / 40% login panel. */
export function NeuShell({ children, defaultSplit = false }: { children: ReactNode; defaultSplit?: boolean }) {
  const [split, setSplit] = useState(defaultSplit);
  return (
    <div className="neu-bg relative flex min-h-screen flex-col overflow-hidden md:h-screen md:flex-row">
      <div className={`relative flex items-center justify-center overflow-hidden bg-background transition-all duration-700 ease-in-out ${split ? "h-[40vh] md:h-full md:w-[60%]" : "h-screen md:w-full"}`}>
        <img src={poster.url} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full scale-110 select-none object-cover blur-2xl opacity-80" />
        <img src={poster.url} alt="Ramky Group – Towards sustainable growth" className="relative h-full w-full object-contain" />
      </div>
      <button
        type="button"
        onClick={() => setSplit((s) => !s)}
        aria-label={split ? "Hide login" : "Show login"}
        className="neu-btn-gradient absolute right-4 top-4 z-20 flex size-12 items-center justify-center rounded-full transition hover:-translate-y-0.5"
      >
        {split ? <PanelRightClose className="size-5" /> : <PanelRightOpen className="size-5" />}
      </button>
      <div className={`relative flex items-center justify-center overflow-hidden transition-all duration-700 ease-in-out ${split ? "flex-1 px-4 py-10 opacity-100 md:w-[40%]" : "h-0 w-0 opacity-0 md:h-full"}`}>
        <div className="neu-raised relative flex aspect-square w-[min(92vw,520px)] items-center justify-center rounded-full p-8 md:w-[min(36vw,520px)]">
          <div className="w-full max-w-[300px]">
            <img src={logo.url} alt="Ramky" className="mx-auto mb-3 h-12 w-auto object-contain" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NeuTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 text-center">
      <h1 className="font-display text-3xl font-extrabold tracking-tight [text-shadow:2px_2px_3px_var(--neu-light)]">{title}</h1>
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
      <div className={`group neu-inset relative flex h-12 items-center gap-3 overflow-hidden rounded-xl px-4 ${error ? "ring-2 ring-[var(--neu-accent)]/40" : ""}`}>
        <span aria-hidden className="neu-field-line pointer-events-none absolute inset-x-0 bottom-0 h-[2px] opacity-70 transition-all group-focus-within:h-[3px] group-focus-within:opacity-100" />
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
    <button {...rest} className="neu-btn-gradient h-12 w-full rounded-xl text-sm font-bold uppercase tracking-[0.15em] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:opacity-60">
      {children}
    </button>
  );
}
