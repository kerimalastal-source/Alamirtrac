import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import CoverIllustration from "@/components/CoverIllustration";
import type { BlogPost } from "@/lib/content";

/** صورة المقال في public/images/blog/<slug>.jpg؛ وإذا لم تُرفع بعد يُعرض الرسم التوضيحي. */
export const hasPostImage = (slug: string) =>
  existsSync(path.join(process.cwd(), "public", "images", "blog", `${slug}.jpg`));

export default function PostCover({
  post,
  size,
  priority = false,
  className = "",
}: {
  post: Pick<BlogPost, "slug" | "title" | "icon">;
  size: "sm" | "md";
  priority?: boolean;
  className?: string;
}) {
  if (!hasPostImage(post.slug)) {
    return <CoverIllustration icon={post.icon} title={post.title} size={size} className={className} />;
  }
  return (
    <Image
      src={`/images/blog/${post.slug}.jpg`}
      alt={post.title}
      width={1280}
      height={720}
      priority={priority}
      sizes={size === "md" ? "(min-width: 1024px) 896px, 100vw" : "(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"}
      className={`aspect-video w-full object-cover ${size === "md" ? "rounded-2xl" : ""} ${className}`}
    />
  );
}
