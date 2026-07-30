// utils/embedUrl.ts
export function toEmbedUrl(url: string): string {
  const trimmed = url.trim();

  if (trimmed.includes("watch?v=")) {
    return trimmed.replace("watch?v=", "embed/");
  }
  if (trimmed.includes("youtu.be/")) {
    const id = trimmed.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (trimmed.includes("youtube.com/shorts/")) {
    const id = trimmed.split("shorts/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  if (trimmed.includes("instagram.com/")) {
    const withoutQuery = trimmed.split("?")[0];
    if (withoutQuery.endsWith("/embed") || withoutQuery.endsWith("/embed/")) {
      return withoutQuery;
    }
    return withoutQuery.endsWith("/")
      ? `${withoutQuery}embed`
      : `${withoutQuery}/embed`;
  }

  return trimmed;
}
