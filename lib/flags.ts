// Switches for the legal and tracking features. They are Vercel environment variables, so the owner turns a
// feature on in Settings → Environment Variables and redeploys, with no code change. Everything here is OFF
// until its variable is set, so nothing reaches visitors before the lawyer's approval.
//
//   NEXT_PUBLIC_PRIVACY_LIVE=1                 cookie banner, /privacy, Meta Pixel and Google Analytics after consent
//   NEXT_PUBLIC_GA_LIVE=1                      Google Analytics too, after consent (off: only Meta Pixel loads after consent)
//   NEXT_PUBLIC_WARRANTY_LIVE=1                /warranty and every "written warranty" wording on the site
//   NEXT_PUBLIC_COMMERCIAL_REGISTER=…          } both set → shown in the footer and the privacy policy
//   NEXT_PUBLIC_TAX_ID=…                       }
//   NEXT_PUBLIC_LEGAL_UPDATED=2026-11-01       "last updated" date on the policy pages
//   NEXT_PUBLIC_OWN_TRACKING_NEEDS_CONSENT=1   also hold the site's own anonymous visit tracking until the visitor accepts
const on = (value: string | undefined) => value === "1" || value === "true";

export const flags = {
  privacy: on(process.env.NEXT_PUBLIC_PRIVACY_LIVE),
  analytics: on(process.env.NEXT_PUBLIC_GA_LIVE),
  warranty: on(process.env.NEXT_PUBLIC_WARRANTY_LIVE),
  ownTrackingNeedsConsent: on(process.env.NEXT_PUBLIC_OWN_TRACKING_NEEDS_CONSENT),
  commercialRegister: process.env.NEXT_PUBLIC_COMMERCIAL_REGISTER?.trim() ?? "",
  taxId: process.env.NEXT_PUBLIC_TAX_ID?.trim() ?? "",
  legalUpdated: process.env.NEXT_PUBLIC_LEGAL_UPDATED?.trim() ?? "",
};

/** The registration numbers are shown only when both are set (never half a line or a placeholder). */
export const hasLegalIds = Boolean(flags.commercialRegister && flags.taxId);
