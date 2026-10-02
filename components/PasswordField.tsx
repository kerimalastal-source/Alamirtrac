"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/Icons";

/** A password input with an eye button that shows or hides what is typed. */
export default function PasswordField({ id, name }: { id: string; name: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required
        autoFocus
        autoComplete="current-password"
        dir="ltr"
        className="w-full rounded-xl border border-border bg-background py-2.5 pl-4 pr-12 text-foreground outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-accent"
      >
        {visible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
