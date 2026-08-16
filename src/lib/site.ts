import { getCanonicalSiteUrl } from "@/lib/site-url";

export const siteConfig = {
  name: "One By One Ministries",
  shortName: "OBOM",
  tagline: "Restoring hope, building faith, and serving people one life at a time.",
  description:
    "One By One Ministries is a ministry website sharing mission, projects, stories, galleries, and opportunities to get involved.",
  url: getCanonicalSiteUrl(),
  email: "contact@onebyoneministries.org",
  phone: "",
  location: "United States & Democratic Republic of Congo",
  /** Main logo (dark on light backgrounds). Used for favicon and structured data. */
  logo: "/assets/brand-transparent/6-web.png",
  /** Fallback OG art when no hero has been uploaded yet. */
  ogImage: "/opengraph-image",
  socialLinks: [
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" }
  ],
  navItems: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Photos", href: "/photos" },
    { label: "Videos", href: "/videos" },
    { label: "Stories", href: "/stories" },
    { label: "Donate", href: "/donate" },
    { label: "Contact", href: "/contact" }
  ]
} as const;

export const brandColors = [
  { name: "Sage", value: "#6E9277", usage: "Primary actions and faith-centered accents" },
  { name: "Gold", value: "#EAC79A", usage: "Warm highlights and calls to action" },
  { name: "Charcoal", value: "#474747", usage: "Body text and high-contrast sections" },
  { name: "Cream", value: "#EFE7DB", usage: "Soft backgrounds" },
  { name: "Plum", value: "#5A4749", usage: "Depth, footer, and editorial emphasis" }
] as const;

export const impactStats = [
  { value: "6", label: "Core website pages ready for ministry storytelling" },
  { value: "SEO", label: "Metadata, sitemap, robots, and structured data included" },
  { value: "100%", label: "Responsive foundation for mobile-first visitors" }
] as const;

export const projects = [
  {
    title: "Community Outreach",
    slug: "community-outreach",
    summary:
      "Practical support, prayer, and encouragement for families and neighbors who need care and connection.",
    focus: "Local service",
    outcomes: ["Volunteer coordination", "Donation-ready storytelling", "Impact reporting"]
  },
  {
    title: "Faith Formation",
    slug: "faith-formation",
    summary:
      "Ministry resources and gatherings that help people grow spiritually and walk with purpose.",
    focus: "Discipleship",
    outcomes: ["Teaching highlights", "Event promotion", "Testimony collection"]
  },
  {
    title: "Mentorship & Care",
    slug: "mentorship-care",
    summary:
      "One-by-one support for individuals through mentoring, pastoral care, and life-giving relationships.",
    focus: "Personal support",
    outcomes: ["Inquiry pathways", "Partner updates", "Story-driven engagement"]
  }
] as const;

export const galleryItems = [
  {
    title: "Outreach moments",
    category: "Photo Story",
    description: "A place to feature ministry photos from outreach gatherings and community care.",
    image: "/images/gallery/outreach.svg"
  },
  {
    title: "Worship and teaching",
    category: "Video Highlight",
    description: "A future-ready block for sermon clips, worship moments, and testimony videos.",
    image: "/images/gallery/worship.svg"
  },
  {
    title: "Volunteer teams",
    category: "Photo Story",
    description: "A visual archive for the people serving behind every ministry initiative.",
    image: "/images/gallery/volunteers.svg"
  },
  {
    title: "Impact stories",
    category: "Testimony",
    description: "Short, permission-based stories that show how lives are being changed one by one.",
    image: "/images/gallery/stories.svg"
  }
] as const;

export const involvementOptions = [
  {
    title: "Pray",
    description:
      "Partner spiritually with the ministry by praying for leaders, families, volunteers, and future outreach.",
    action: "Join the prayer list"
  },
  {
    title: "Serve",
    description:
      "Use your gifts through outreach support, event help, media, administration, or care-team involvement.",
    action: "Explore volunteer roles"
  },
  {
    title: "Give",
    description:
      "Support current projects and future growth through transparent, mission-aligned giving opportunities.",
    action: "Request giving details"
  }
] as const;

export const testimonials = [
  {
    quote:
      "This section is designed for real ministry testimonies, reviewed for consent and edited for clarity before launch.",
    person: "Future testimony",
    role: "Community member"
  },
  {
    quote:
      "The website structure helps visitors understand the mission, see the work, and take a clear next step.",
    person: "Future partner",
    role: "Ministry supporter"
  }
] as const;
