import { format, formatDistanceToNow } from "date-fns";

function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function safeFormatDistanceToNow(
  dateStr: string | null | undefined,
  fallback = "—"
): string {
  const d = parseDate(dateStr);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : fallback;
}

export function safeFormat(
  dateStr: string | null | undefined,
  formatStr: string,
  fallback = "—"
): string {
  const d = parseDate(dateStr);
  return d ? format(d, formatStr) : fallback;
}
