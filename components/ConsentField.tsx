import Link from "next/link";
import { flags } from "@/lib/flags";

/** The required consent checkbox of the request forms (the policy link joins once the privacy page is live). */
export default function ConsentField({ id }: { id: string }) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name="consent"
        type="checkbox"
        value="yes"
        required
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
      <label htmlFor={id} className="text-sm leading-6 text-muted">
        أوافق على استخدام بياناتي للتواصل معي بخصوص طلبي.
        {flags.privacy && (
          <>
            {" "}
            <Link href="/privacy" className="font-bold text-accent underline">
              سياسة الخصوصية
            </Link>
          </>
        )}
      </label>
    </div>
  );
}
