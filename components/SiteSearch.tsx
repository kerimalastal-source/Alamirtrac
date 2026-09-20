"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { searchSite } from "@/lib/search";
import { SearchIcon, CloseIcon } from "@/components/Icons";

export default function SiteSearch({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function reset() {
    setQuery("");
    setFocused(false);
    inputRef.current?.blur();
  }

  const results = searchSite(query);
  const showDropdown = focused && query.trim() !== "";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2">
        <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") reset();
          }}
          placeholder="ابحث في الموقع..."
          className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
        />
        {query !== "" && (
          <button
            type="button"
            onClick={reset}
            aria-label="مسح البحث"
            className="shrink-0 text-muted transition-colors hover:text-foreground"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute end-0 top-full z-50 mt-2 max-h-[70vh] w-full min-w-[18rem] overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">لا توجد نتائج مطابقة لبحثك.</p>
          ) : (
            <ul className="space-y-1">
              {results.map((item) => (
                <li key={`${item.category}-${item.title}`}>
                  <Link
                    href={item.url}
                    onClick={reset}
                    className="block rounded-lg px-3 py-2 transition-colors hover:bg-surface-2"
                  >
                    <span className="text-xs font-bold text-accent">{item.category}</span>
                    <div className="mt-0.5 text-sm font-bold text-foreground">{item.title}</div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{item.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
