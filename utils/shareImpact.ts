// One place that builds the "share my impact" message + does the actual share, so
// the post-purchase celebration and the Impact page share the identical behavior.
// Pure arithmetic on the user's own numbers — works for user #1 with zero density,
// and is the only free growth lever at launch (their own social graph).

const SHARE_URL = 'https://goodcircles.org';

export interface ImpactShare {
  donated?: number;
  saved?: number;
  nonprofitName?: string;
}

export type ShareResult = 'shared' | 'copied' | 'failed';

function fmt(n?: number): string {
  return n && n > 0 ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '';
}

// Pure (testable): the personalized message. Names the org + amount when we have them.
export function buildShareText(s: ImpactShare): string {
  if (s.nonprofitName && s.donated && s.donated > 0) {
    return `I just sent ${fmt(s.donated)} to ${s.nonprofitName} — automatically, just by shopping local on Good Circles. No fundraiser, no extra cost to me. Join the circle:`;
  }
  if (s.donated && s.donated > 0) {
    const saved = s.saved && s.saved > 0 ? ` and saved ${fmt(s.saved)} doing it` : '';
    return `I've directed ${fmt(s.donated)} to local nonprofits just by shopping local on Good Circles${saved}. Join the circle:`;
  }
  return `Good Circles turns everyday local shopping into automatic support for the nonprofits you choose. Join the circle:`;
}

export async function shareImpact(s: ImpactShare): Promise<ShareResult> {
  const text = buildShareText(s);
  const full = `${text} ${SHARE_URL}`;
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;

  if (nav?.share) {
    try {
      await nav.share({ title: 'My Good Circles Impact', text, url: SHARE_URL });
      return 'shared';
    } catch (e: any) {
      if (e?.name === 'AbortError') return 'failed'; // user cancelled the sheet — don't silently copy
      // any other error: fall through to clipboard
    }
  }
  try {
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(full);
      return 'copied';
    }
  } catch {
    /* clipboard blocked */
  }
  return 'failed';
}
