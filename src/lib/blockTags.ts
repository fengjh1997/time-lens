import type { Tag, TimeBlock } from "@/types";

export function getBlockTagIds(block?: TimeBlock | null) {
  if (!block) return [] as string[];
  if (Array.isArray(block.tagIds) && block.tagIds.length > 0) return block.tagIds;
  return block.tagId ? [block.tagId] : [];
}

export function getBlockTags(block: TimeBlock | null | undefined, tags: Tag[]) {
  const tagIds = getBlockTagIds(block);
  return tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is Tag => Boolean(tag));
}

export function blockMatchesTagFilter(block: TimeBlock | null | undefined, selectedTagIds: string[]) {
  if (!selectedTagIds.length) return true;
  const tagIds = getBlockTagIds(block);
  return selectedTagIds.some((tagId) => tagIds.includes(tagId));
}
