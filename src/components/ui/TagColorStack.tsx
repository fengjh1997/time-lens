"use client";

import type { Tag } from "@/types";

export default function TagColorStack({
  tags,
  className = "",
  emptyClassName = "",
}: {
  tags: Tag[];
  className?: string;
  emptyClassName?: string;
}) {
  if (tags.length === 0) {
    return <div className={emptyClassName} />;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {tags.map((tag) => (
        <div key={tag.id} className="w-full" style={{ height: `${100 / tags.length}%`, backgroundColor: tag.color }} />
      ))}
    </div>
  );
}
