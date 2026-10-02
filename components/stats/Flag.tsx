import Image from "next/image";

/** A country's flag from /public/flags (Windows does not draw flag emoji), or a globe when the country is unknown. */
export default function Flag({ code, className = "" }: { code: string | null | undefined; className?: string }) {
  if (!code || !/^[a-zA-Z]{2}$/.test(code)) {
    return (
      <span aria-hidden="true" className={`inline-flex h-[18px] w-6 shrink-0 items-center justify-center text-sm leading-none ${className}`}>
        🌐
      </span>
    );
  }
  return (
    <Image
      src={`/flags/${code.toLowerCase()}.svg`}
      alt=""
      width={24}
      height={18}
      unoptimized
      className={`inline-block h-[18px] w-6 shrink-0 rounded-[3px] border border-border object-cover ${className}`}
    />
  );
}
