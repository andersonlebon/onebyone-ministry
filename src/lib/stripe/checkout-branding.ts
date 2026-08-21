import { getCanonicalSiteUrl } from "@/lib/site-url";

/** One By One Ministries brand tokens (matches site + email templates). */
export const STRIPE_BRAND = {
  green: "#6E9277",
  gold: "#EAC79A",
  cream: "#EFE7DB",
  charcoal: "#474747",
} as const;

export function stripeCheckoutBranding() {
  const siteUrl = getCanonicalSiteUrl();
  const logoUrl = `${siteUrl}/assets/brand-transparent/8-web.png`;

  return {
    logoUrl,
    brandingSettings: {
      background_color: STRIPE_BRAND.cream,
      button_color: STRIPE_BRAND.green,
      border_style: "rounded" as const,
      display_name: "One By One Ministries",
    },
    customText: {
      submit: {
        message:
          "Your gift supports education, entrepreneurship, and discipleship in the Democratic Republic of Congo.",
      },
      after_submit: {
        message:
          "Thank you for partnering with One By One Ministries. A confirmation email is on its way.",
      },
    },
    product: {
      name: "Donation to One By One Ministries",
      description:
        "Rebuilding communities in the DRC through Education, Entrepreneurship, and Discipleship — one person at a time.",
      images: [logoUrl],
    },
  };
}
