"use client";

import { useEffect, useRef } from "react";

/**
 * Anti-spam fields for the request forms: a honeypot that people never see or fill, and the time the form
 * was opened, so the server can ignore submissions sent faster than a person could type them.
 */
export default function FormGuard() {
  const startedAt = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);

  return (
    <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
      <label>
        الموقع الإلكتروني
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="" />
    </div>
  );
}
