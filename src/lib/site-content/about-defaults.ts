import type {
  AboutLocation,
  AboutPageContent,
  AboutPerson,
  AboutSocialLink,
  AboutSocialPlatform,
} from "./types";

const PLATFORMS: AboutSocialPlatform[] = [
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "youtube",
  "website",
];

function normalizeSocialLinks(raw: unknown): AboutSocialLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const url = typeof row.url === "string" ? row.url.trim() : "";
      if (!url) return null;
      const platform =
        typeof row.platform === "string" && PLATFORMS.includes(row.platform as AboutSocialPlatform)
          ? (row.platform as AboutSocialPlatform)
          : "website";
      const id =
        typeof row.id === "string" && row.id.trim()
          ? row.id
          : `social-${index}-${platform}`;
      return { id, platform, url };
    })
    .filter((x): x is AboutSocialLink => Boolean(x));
}

function normalizePerson(raw: unknown, index: number): AboutPerson | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const name = typeof row.name === "string" ? row.name.trim() : "";
  if (!name) return null;
  return {
    id: typeof row.id === "string" && row.id.trim() ? row.id : `person-${index}`,
    name,
    role: typeof row.role === "string" ? row.role : "",
    bio: typeof row.bio === "string" ? row.bio : "",
    img: typeof row.img === "string" ? row.img : "",
    socialLinks: normalizeSocialLinks(row.socialLinks),
    sortOrder: typeof row.sortOrder === "number" ? row.sortOrder : index,
  };
}

function normalizePeople(raw: unknown, fallback: AboutPerson[]): AboutPerson[] {
  if (!Array.isArray(raw)) return fallback.map((p) => ({ ...p, socialLinks: [...p.socialLinks] }));
  const people = raw
    .map((item, index) => normalizePerson(item, index))
    .filter((p): p is AboutPerson => Boolean(p));
  return people.length > 0
    ? people.sort((a, b) => a.sortOrder - b.sortOrder)
    : fallback.map((p) => ({ ...p, socialLinks: [...p.socialLinks] }));
}

function normalizeLocations(raw: unknown, fallback: AboutLocation[]): AboutLocation[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return fallback.map((loc) => ({ ...loc }));
  }
  return raw.map((item, index) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const fallbackLoc = fallback[index] ?? fallback[0];
    return {
      id: typeof row.id === "string" && row.id.trim() ? row.id : fallbackLoc.id,
      label: typeof row.label === "string" && row.label.trim() ? row.label : fallbackLoc.label,
      description:
        typeof row.description === "string" ? row.description : fallbackLoc.description,
      lat: typeof row.lat === "number" && Number.isFinite(row.lat) ? row.lat : fallbackLoc.lat,
      lng: typeof row.lng === "number" && Number.isFinite(row.lng) ? row.lng : fallbackLoc.lng,
    };
  });
}

/** Default About page copy, people, locations, and founders timeline (editable in DB). */
export function getDefaultAboutContent(): AboutPageContent {
  return {
    storyEyebrow: "How It Began",
    storyTitle: "A Vision Born in the Heart of Congo",
    storyBody1:
      "One By One Ministries began with a single trip to the Democratic Republic of Congo. What our founders witnessed — children without schools, families without economic hope, rural villages with little Gospel access — compelled them to act.",
    storyBody2:
      "The name says it all. We believe transformation doesn't happen in sweeping programs. It happens one person at a time, one family at a time — through patient, faithful work of love, discipleship, and service.",
    storyQuote:
      '"We believe the DRC is ready for a generation-defining revival — and we are privileged to be part of it."',
    visionText:
      "A world where every person — regardless of geography, poverty, or circumstance — has access to the transformative love of Jesus Christ, quality education, and the opportunity to build a dignified, flourishing life.",
    missionText:
      "One By One Ministries is dedicated to rebuilding communities through Education, Entrepreneurship, and Spiritual Discipleship — changing the world one person, one community, and one country at a time through the power of the Holy Spirit and the Word of God.",
    foundersEyebrow: "The Beginning",
    foundersTitle: "Our Founders",
    foundersIntro:
      "Two lives, two continents, and one calling that grew into One By One Ministries.",
    leadershipEyebrow: "Guiding the Mission",
    leadershipTitle: "Leadership",
    leadershipIntro: "Board and ministry leaders who steward vision, integrity, and growth.",
    teamEyebrow: "On the Ground",
    teamTitle: "Team Members",
    teamIntro: "Partners and staff serving communities in the DRC and supporting from the USA.",
    locationsEyebrow: "Where We Serve",
    locationsTitle: "Our Locations",
    locationsIntro: "Ministry roots in the Democratic Republic of Congo and a base in the United States.",
    timelineEyebrow: "The Story Behind the Mission",
    timelineTitle: "Our Founders' Journey",
    timelineIntro:
      "One By One Ministries was born from the story of two people, two continents, and one calling. Here is the living tree of how it all began.",
    timelineFruitLabel: "Today's Fruit",
    timelineFruitTitle: "18+ Communities",
    timelineFruitSub: "500+ families · 8 education projects · 65+ volunteers · DRC & Rwanda",
    roots: [
      { id: "root-emmanuel", label: "Emmanuel Tshilobo", sub: "Born in Kinshasa, DRC · 1982", color: "#6E9277" },
      { id: "root-grace", label: "Grace Johnson", sub: "Born in Atlanta, USA · 1985", color: "#EAC79A" },
    ],
    founders: [
      {
        id: "emmanuel-tshilobo",
        name: "Rev. Emmanuel Tshilobo",
        role: "Executive Director & Co-Founder",
        bio: "Born in the DRC, Emmanuel has served in ministry for 20+ years with a heart for reconciling the church with its community calling.",
        img: "",
        socialLinks: [],
        sortOrder: 0,
      },
      {
        id: "grace-tshilobo",
        name: "Grace Tshilobo",
        role: "Director of Programs & Co-Founder",
        bio: "Grace brings expertise in women's development, entrepreneurship education, and cross-cultural program design.",
        img: "",
        socialLinks: [],
        sortOrder: 1,
      },
    ],
    leadership: [],
    team: [
      {
        id: "jonathan-kalala",
        name: "Jonathan Kalala",
        role: "Community Development Lead",
        bio: "A native of Kasai Province, Jonathan builds relationships with village leaders so every project is community-owned.",
        img: "",
        socialLinks: [],
        sortOrder: 0,
      },
    ],
    locations: [
      {
        id: "loc-congo",
        label: "Democratic Republic of Congo",
        description: "Field ministry, schools, and community partnerships across the DRC.",
        lat: -1.678,
        lng: 29.228,
      },
      {
        id: "loc-usa",
        label: "United States",
        description: "Ministry base, partnerships, and support for the work in Congo.",
        lat: 33.749,
        lng: -84.388,
      },
    ],
    timeline: [
      {
        id: "ms-2010",
        year: "2010",
        title: "A Providential Meeting",
        desc: "Emmanuel and Grace meet at an international Christian conference in Nairobi, Kenya. Both were there serving their respective ministry organizations — a divine appointment.",
        icon: "Star",
        color: "#EAC79A",
        img: "",
        side: "left",
      },
      {
        id: "ms-2012",
        year: "2012",
        title: "A Covenant of Love",
        desc: "Emmanuel and Grace marry in a beautiful ceremony uniting two continents — a living symbol of the cross-cultural ministry they would one day build together.",
        icon: "Heart",
        color: "#5A4749",
        img: "",
        side: "right",
      },
      {
        id: "ms-2014",
        year: "2014",
        title: "The Vision Trip",
        desc: "Together they travel to rural Congo for the first time as a couple. What they witness — children without schools, families without hope — breaks them open and changes everything.",
        icon: "Globe",
        color: "#6E9277",
        img: "",
        side: "left",
      },
      {
        id: "ms-2015",
        year: "2015",
        title: "One By One Ministries Founded",
        desc: "After months of prayer and planning, Emmanuel and Grace officially incorporate One By One Ministries Inc. The name captures their conviction: transformation happens one person at a time.",
        icon: "Leaf",
        color: "#6E9277",
        img: "",
        side: "right",
      },
      {
        id: "ms-2019",
        year: "2019",
        title: "First School Opens",
        desc: "After four years of grassroots fundraising and community partnership, the first OBOM school building opens in a remote village outside Kinshasa — serving 85 children on day one.",
        icon: "BookOpen",
        color: "#6E9277",
        img: "",
        side: "left",
      },
      {
        id: "ms-2021",
        year: "2021",
        title: "Entrepreneurship Program Launched",
        desc: "Grace leads the launch of the Women's Entrepreneurship Cohort — a program she designed from the ground up — empowering 30 women in its first year.",
        icon: "Star",
        color: "#EAC79A",
        img: "",
        side: "right",
      },
      {
        id: "ms-2023",
        year: "2023",
        title: "Pastoral Training Network",
        desc: "Emmanuel, a trained theologian, launches the Pastoral Training Network — equipping 15 rural pastors in the first cohort across five provinces.",
        icon: "Users",
        color: "#5A4749",
        img: "",
        side: "left",
      },
      {
        id: "ms-2025",
        year: "2025",
        title: "A Decade of Faithfulness",
        desc: "Now serving 18+ communities across the DRC, with programs reaching 500+ families, 65+ volunteers, and expanding into Rwanda — the fruit of two lives poured out for the Kingdom.",
        icon: "Globe",
        color: "#6E9277",
        img: "",
        side: "right",
      },
    ],
  };
}

type LegacyAbout = Partial<AboutPageContent> & {
  team?: unknown;
  founders?: unknown;
  leadership?: unknown;
  values?: unknown;
  valuesEyebrow?: unknown;
  valuesTitle?: unknown;
  whyCongoEyebrow?: unknown;
  whyCongoTitle?: unknown;
  whyCongoBody1?: unknown;
  whyCongoBody2?: unknown;
};

/**
 * Merge stored About JSON with defaults.
 * Migrates legacy single `team` list, strips removed Core Values / Why Congo keys.
 */
export function mergeAboutContent(stored: AboutPageContent | null | undefined): AboutPageContent {
  const defaults = getDefaultAboutContent();
  if (!stored || typeof stored !== "object") return defaults;

  const legacy = stored as LegacyAbout;
  const hasFounders = Array.isArray(legacy.founders);
  const hasLeadership = Array.isArray(legacy.leadership);
  const legacyTeam = Array.isArray(legacy.team) ? legacy.team : null;

  let founders = normalizePeople(legacy.founders, defaults.founders);
  let leadership = normalizePeople(legacy.leadership, defaults.leadership);
  let team = normalizePeople(legacy.team, defaults.team);

  // One-time shape migration: old single team[] → founders + team when new lists missing.
  if (!hasFounders && !hasLeadership && legacyTeam) {
    const migrated = normalizePeople(legacyTeam, []);
    const founderLike = migrated.filter(
      (p) => /founder/i.test(p.role) || /founder/i.test(p.name)
    );
    const rest = migrated.filter((p) => !founderLike.includes(p));
    founders =
      founderLike.length > 0
        ? founderLike.map((p, i) => ({ ...p, sortOrder: i }))
        : migrated.slice(0, 2).map((p, i) => ({ ...p, sortOrder: i }));
    leadership = [];
    team =
      founderLike.length > 0
        ? rest.map((p, i) => ({ ...p, sortOrder: i }))
        : migrated.slice(2).map((p, i) => ({ ...p, sortOrder: i }));
  }

  return {
    storyEyebrow: pickString(legacy.storyEyebrow, defaults.storyEyebrow),
    storyTitle: pickString(legacy.storyTitle, defaults.storyTitle),
    storyBody1: pickString(legacy.storyBody1, defaults.storyBody1),
    storyBody2: pickString(legacy.storyBody2, defaults.storyBody2),
    storyQuote: pickString(legacy.storyQuote, defaults.storyQuote),
    visionText: pickString(legacy.visionText, defaults.visionText),
    missionText: pickString(legacy.missionText, defaults.missionText),
    foundersEyebrow: pickString(legacy.foundersEyebrow, defaults.foundersEyebrow),
    foundersTitle: pickString(legacy.foundersTitle, defaults.foundersTitle),
    foundersIntro: pickString(legacy.foundersIntro, defaults.foundersIntro),
    leadershipEyebrow: pickString(legacy.leadershipEyebrow, defaults.leadershipEyebrow),
    leadershipTitle: pickString(legacy.leadershipTitle, defaults.leadershipTitle),
    leadershipIntro: pickString(legacy.leadershipIntro, defaults.leadershipIntro),
    teamEyebrow: pickString(legacy.teamEyebrow, defaults.teamEyebrow),
    teamTitle: pickString(
      legacy.teamTitle === "Founders, board & team" ? defaults.teamTitle : legacy.teamTitle,
      defaults.teamTitle
    ),
    teamIntro: pickString(legacy.teamIntro, defaults.teamIntro),
    locationsEyebrow: pickString(legacy.locationsEyebrow, defaults.locationsEyebrow),
    locationsTitle: pickString(legacy.locationsTitle, defaults.locationsTitle),
    locationsIntro: pickString(legacy.locationsIntro, defaults.locationsIntro),
    timelineEyebrow: pickString(legacy.timelineEyebrow, defaults.timelineEyebrow),
    timelineTitle: pickString(legacy.timelineTitle, defaults.timelineTitle),
    timelineIntro: pickString(legacy.timelineIntro, defaults.timelineIntro),
    timelineFruitLabel: pickString(legacy.timelineFruitLabel, defaults.timelineFruitLabel),
    timelineFruitTitle: pickString(legacy.timelineFruitTitle, defaults.timelineFruitTitle),
    timelineFruitSub: pickString(legacy.timelineFruitSub, defaults.timelineFruitSub),
    roots:
      Array.isArray(legacy.roots) && legacy.roots.length > 0 ? legacy.roots : defaults.roots,
    founders,
    leadership,
    team,
    locations: normalizeLocations(legacy.locations, defaults.locations),
    timeline:
      Array.isArray(legacy.timeline) && legacy.timeline.length > 0
        ? legacy.timeline
        : defaults.timeline,
  };
}

function pickString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

/** Persistable About payload with removed legacy keys never written back. */
export function sanitizeAboutForWrite(about: AboutPageContent): AboutPageContent {
  return mergeAboutContent(about);
}
