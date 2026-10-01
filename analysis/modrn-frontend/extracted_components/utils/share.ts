import { env } from "@/config/env.config";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

/** Absolute URL for a path (uses window origin in browser). */
export function absoluteAppUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${normalized}`;
  }
  return `${env.appUrl.replace(/\/$/, "")}${normalized}`;
}

/** Always share the public hospital page so logged-out recipients can open it. */
export function publicHospitalPath(facilityId: string): string {
  return `/hospitals/${encodeURIComponent(facilityId)}`;
}

/** Public candidate / student profile page accessible to logged-out users. */
export function publicProfilePath(alias: string): string {
  return `/profile/${encodeURIComponent(alias)}`;
}

/** Public single scholarship page accessible to logged-out users. */
export function publicScholarshipPath(id: number | string): string {
  return `/scholarships/${encodeURIComponent(id)}`;
}

export function buildScholarshipSharePayload(input: {
  id: number | string;
  name: string;
  provider: string;
  amount: string;
}): SharePayload {
  const name = input.name.trim() || "Nursing Scholarship";
  const amount = input.amount || "Financial Aid";
  const provider = input.provider || "Foundation";
  return {
    title: `${name} — MODRN Scholarships`,
    text: `${name} (${amount}) by ${provider}. View eligibility and apply on MODRN.`,
    url: absoluteAppUrl(publicScholarshipPath(input.id)),
  };
}/** Public single school page accessible to logged-out users. */
export function publicSchoolPath(placeId: string): string {
  return `/schools/${encodeURIComponent(placeId)}`;
}

export function buildSchoolSharePayload(input: {
  placeId: string;
  name: string;
  city?: string;
  state?: string;
  avgOverall?: number | null;
  reviewCount?: number;
  nclexPassRate?: string | null;
}): SharePayload {
  const name = input.name.trim() || "Nursing School";
  const place = [input.city, input.state].filter(Boolean).join(", ");
  const count = input.reviewCount ?? 0;
  const avg = input.avgOverall;
  const ratingLine =
    count > 0 && avg != null
      ? `${avg.toFixed(1)}/5 stars from ${count.toLocaleString()} student evaluation${count === 1 ? "" : "s"}.`
      : input.nclexPassRate
      ? `${input.nclexPassRate} 1st-time NCLEX pass rate.`
      : "Accredited nursing program intelligence on MODRN.";

  return {
    title: `${name} — Nursing School Ratings`,
    text: `${name} (${place || "US"}): ${ratingLine}`,
    url: absoluteAppUrl(publicSchoolPath(input.placeId)),
  };
}

export function buildHospitalSharePayload(input: {
  facilityId: string;
  hospitalName: string;
  city?: string;
  state?: string;
  nurseReviewCount?: number;
  nurseAvgOverall?: number | null;
}): SharePayload {
  const name = input.hospitalName.trim() || "Facility";
  const place = [input.city, input.state].filter(Boolean).join(", ");
  const count = input.nurseReviewCount ?? 0;
  const avg = input.nurseAvgOverall;
  const ratingLine =
    count > 0 && avg != null
      ? `${avg.toFixed(1)}/5 from ${count.toLocaleString()} MODRN nurse rating${count === 1 ? "" : "s"}.`
      : "Nurse ratings and facility intel on MODRN RN Collective.";

  const textParts = [
    ratingLine,
    place ? `${name} · ${place}` : name,
  ];

  return {
    title: `${name} — MODRN RN Collective`,
    text: textParts.join(" "),
    url: absoluteAppUrl(publicHospitalPath(input.facilityId)),
  };
}

export function canUseNativeShare(data?: SharePayload): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (!data || typeof navigator.canShare !== "function") {
    return true;
  }
  try {
    return navigator.canShare({
      title: data.title,
      text: data.text,
      url: data.url,
    });
  } catch {
    return true;
  }
}

export type NativeShareResult = "shared" | "cancelled" | "unavailable" | "failed";

/** Try Web Share API. Does not fall back — caller handles menu/clipboard. */
export async function tryNativeShare(
  data: SharePayload,
): Promise<NativeShareResult> {
  if (!canUseNativeShare(data)) return "unavailable";
  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return "cancelled";
    }
    return "failed";
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function shareIntentUrl(
  channel: "x" | "linkedin" | "facebook" | "whatsapp" | "email",
  data: SharePayload,
): string {
  const encodedUrl = encodeURIComponent(data.url);
  const encodedText = encodeURIComponent(data.text);
  const encodedTitle = encodeURIComponent(data.title);
  switch (channel) {
    case "x":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${data.text} ${data.url}`)}`;
    case "email":
      return `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${data.text}\n\n${data.url}`)}`;
  }
}
