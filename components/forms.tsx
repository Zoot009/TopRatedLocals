"use client";

import { Star, Trophy } from "lucide-react";
import Link from "next/link";
import { createContext, useActionState, useContext, useState } from "react";
import type { FormState } from "@/lib/actions";
import { cn, inputClass } from "@/lib/utils";

// Server-rendered pages compose these fields; ActionForm shares the action's result with them.
const FormContext = createContext<FormState>({ ok: false });

const submitClass =
  "rounded-sm bg-primary px-8 py-3.5 font-display text-lg font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark disabled:opacity-60";

export function ActionForm({
  action,
  submitLabel,
  children,
  done,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  children: React.ReactNode;
  done?: { href: string; label: string };
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });

  if (state.ok) {
    return (
      <div role="status" className="rounded-md bg-graphite bg-stripes p-8 text-center text-white">
        <span className="mx-auto flex size-16 items-center justify-center rounded-sm bg-primary text-primary-foreground">
          <Trophy className="size-8" />
        </span>
        <p className="mt-4 font-display text-3xl font-bold uppercase italic">That&apos;s in. Thank you!</p>
        <p className="mx-auto mt-2 max-w-md text-white/80">{state.message}</p>
        {done && (
          <Link href={done.href} className={cn(submitClass, "mt-6 inline-block")}>
            {done.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <FormContext value={state}>
      <form action={formAction} className="relative space-y-5 rounded-md border border-t-4 border-t-primary bg-card p-6 shadow-soft sm:p-8">
        {state.message && (
          <p role="alert" className="rounded-sm border-l-4 border-destructive bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {state.message}
          </p>
        )}
        {children}
        {/* Spam trap: off-screen and skipped by keyboard; people never fill it, bots usually do. */}
        <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label>
            Fax
            <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button type="submit" disabled={pending} className={cn(submitClass, "w-full sm:w-auto")}>
          {pending ? "Sending…" : submitLabel}
        </button>
      </form>
    </FormContext>
  );
}

type FieldProps = { name: string; label: string; hint?: string; optional?: boolean };

function useField(name: string) {
  const { errors, values } = useContext(FormContext);
  const error = errors?.[name]?.[0];
  return { error, value: values?.[name], describedBy: error ? `${name}-error` : undefined };
}

function Wrapper({ name, label, hint, optional, error, children }: FieldProps & { error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="block font-display font-bold tracking-wide uppercase">
        {label}
        {optional && <span className="ml-2 rounded-sm bg-tint px-1.5 py-0.5 font-sans text-xs font-semibold tracking-normal text-muted-foreground normal-case">optional</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ name, label, hint, optional, ...input }: FieldProps & React.ComponentProps<"input">) {
  const { error, value, describedBy } = useField(name);
  return (
    <Wrapper name={name} label={label} hint={hint} optional={optional} error={error}>
      <input id={name} name={name} defaultValue={value} required={!optional} aria-invalid={!!error} aria-describedby={describedBy} className={inputClass} {...input} />
    </Wrapper>
  );
}

export function TextArea({ name, label, hint, optional, minLength, ...input }: FieldProps & React.ComponentProps<"textarea">) {
  const { error, value, describedBy } = useField(name);
  const [length, setLength] = useState(value?.trim().length ?? 0);
  return (
    <Wrapper name={name} label={label} hint={hint} optional={optional} error={error}>
      <textarea
        id={name}
        name={name}
        defaultValue={value}
        required={!optional}
        minLength={minLength}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        onChange={(e) => setLength(e.target.value.trim().length)}
        className={cn(inputClass, "min-h-32")}
        {...input}
      />
      {minLength && (
        <div className="mt-2 flex items-center gap-2" aria-live="polite">
          <span className="h-1.5 flex-1 overflow-hidden rounded-sm bg-tint">
            <span className="block h-full bg-primary transition-all" style={{ width: `${Math.min(100, (length / minLength) * 100)}%` }} />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">{length >= minLength ? "That's enough to count" : `${minLength - length} to go`}</span>
        </div>
      )}
    </Wrapper>
  );
}

export function SelectField({ name, label, hint, optional, children }: FieldProps & { children: React.ReactNode }) {
  const { error, value, describedBy } = useField(name);
  return (
    <Wrapper name={name} label={label} hint={hint} optional={optional} error={error}>
      {/* Keyed on the echoed value so a failed submit shows the choice again instead of resetting it. */}
      <select key={value ?? ""} id={name} name={name} defaultValue={value ?? ""} required={!optional} aria-invalid={!!error} aria-describedby={describedBy} className={inputClass}>
        <option value="" disabled>
          Pick one…
        </option>
        {children}
      </select>
    </Wrapper>
  );
}

export function CheckboxField({ name, label }: { name: string; label: string }) {
  const { error, value, describedBy } = useField(name);
  return (
    <div>
      <label className="flex items-start gap-3 rounded-sm bg-tint p-4 text-sm font-semibold">
        <input type="checkbox" name={name} defaultChecked={value === "on"} required aria-invalid={!!error} aria-describedby={describedBy} className="mt-0.5 size-4 accent-primary-ink" />
        {label}
      </label>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const STAR_LABELS = ["Not for me", "Could be better", "It was fine", "Really good", "Loved it"];

// Five radio buttons as square star tiles; the label below says what each choice means.
export function StarPicker({ name = "rating" }: { name?: string }) {
  const { error, value: initial } = useField(name);
  const [value, setValue] = useState(Number(initial) || 0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined} className="rounded-sm bg-tint p-5 text-center">
      <legend className="sr-only">Your rating</legend>
      <p aria-hidden className="font-display text-xl font-bold uppercase italic">
        Your score
      </p>
      <div className="mt-3 flex justify-center gap-2" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            onMouseEnter={() => setHover(n)}
            className={cn(
              "flex size-12 cursor-pointer items-center justify-center rounded-sm border-2 transition has-focus-visible:ring-3 has-focus-visible:ring-primary-ink/50",
              n <= shown ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground/30",
            )}
          >
            {/* Uncontrolled and keyed on the echoed value, so a failed submit keeps the rating. */}
            <input
              key={initial ?? ""}
              type="radio"
              name={name}
              value={n}
              defaultChecked={Number(initial) === n}
              onChange={() => setValue(n)}
              required
              className="sr-only"
            />
            <Star className="size-6 fill-current stroke-none" />
            <span className="sr-only">
              {n} {n === 1 ? "star" : "stars"}: {STAR_LABELS[n - 1]}
            </span>
          </label>
        ))}
      </div>
      <p aria-hidden className="mt-3 font-display font-bold tracking-wide text-primary-ink uppercase">
        {shown ? STAR_LABELS[shown - 1] : "Tap a star"}
      </p>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
