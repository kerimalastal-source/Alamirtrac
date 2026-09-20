"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { searchSite } from "@/lib/search";
import { SearchIcon, CloseIcon } from "@/components/Icons";

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function closeSearch() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSearch();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = searchSite(query);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="بحث في الموقع"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-2 hover:text-accent"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-start justify-center bg-dark/60 px-4 pt-20 backdrop-blur-sm sm:pt-28"
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl bg-surface shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث عن خدمة، مقالة، أو سؤال..."
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted"
              />
              <button
                type="button"
                onClick={closeSearch}
                aria-label="إغلاق البحث"
                className="shrink-0 text-muted transition-colors hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.trim() === "" ? (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  اكتب كلمة للبحث في خدماتنا ومقالاتنا والأسئلة الشائعة.
                </p>
              ) : results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted">لا توجد نتائج مطابقة لبحثك.</p>
              ) : (
                <ul className="space-y-1">
                  {results.map((item) => (
                    <li key={`${item.category}-${item.title}`}>
                      <Link
                        href={item.url}
                        onClick={closeSearch}
                        className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2"
                      >
                        <span className="text-xs font-bold text-accent">{item.category}</span>
                        <div className="mt-0.5 font-bold text-foreground">{item.title}</div>
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted">{item.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
