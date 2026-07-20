import type { AboutPageContent } from "./types";

/** Default About page copy, team, values, and founders timeline (editable in DB). */
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
    valuesEyebrow: "What Drives Us",
    valuesTitle: "Our Core Values",
    teamEyebrow: "Our People",
    teamTitle: "Founders, board & team",
    teamIntro: "Leadership in the USA and a team on the ground in the DRC Congo, working together.",
    whyCongoEyebrow: "Why Congo",
    whyCongoTitle: "The DRC: Immense Need, Immense Promise",
    whyCongoBody1:
      "The Democratic Republic of Congo is among the world's most impoverished nations, yet it is rich in natural resources and extraordinary people — resilient, joyful, faith-filled communities hungry for opportunity and for Christ.",
    whyCongoBody2:
      "We believe the DRC is on the threshold of a generation-defining transformation, and we are called to be part of it — not through charity, but through partnership that restores dignity and builds lasting foundations.",
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
    values: [
      {
        id: "val-christ",
        title: "Christ-Centered",
        desc: "Everything we do flows from the Gospel and the love of Jesus.",
        icon: "Heart",
      },
      {
        id: "val-dignity",
        title: "Dignity",
        desc: "We partner with communities as equals, never as saviors.",
        icon: "Users",
      },
      {
        id: "val-faithfulness",
        title: "Faithfulness",
        desc: "Long-term presence over short-term programs.",
        icon: "Leaf",
      },
      {
        id: "val-excellence",
        title: "Excellence",
        desc: "Stewardship that honors God and those we serve.",
        icon: "Star",
      },
      {
        id: "val-unity",
        title: "Unity",
        desc: "Bridging cultures, churches, and continents in one mission.",
        icon: "Globe",
      },
    ],
    team: [
      {
        id: "emmanuel-tshilobo",
        name: "Rev. Emmanuel Tshilobo",
        role: "Executive Director & Co-Founder",
        bio: "Born in the DRC, Emmanuel has served in ministry for 20+ years with a heart for reconciling the church with its community calling.",
        region: "DRC & USA",
        img: "",
        sortOrder: 0,
      },
      {
        id: "grace-tshilobo",
        name: "Grace Tshilobo",
        role: "Director of Programs & Co-Founder",
        bio: "Grace brings expertise in women's development, entrepreneurship education, and cross-cultural program design.",
        region: "USA",
        img: "",
        sortOrder: 1,
      },
      {
        id: "jonathan-kalala",
        name: "Jonathan Kalala",
        role: "Community Development Lead",
        bio: "A native of Kasai Province, Jonathan builds relationships with village leaders so every project is community-owned.",
        region: "DRC",
        img: "",
        sortOrder: 2,
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

export function mergeAboutContent(stored: AboutPageContent | null | undefined): AboutPageContent {
  const defaults = getDefaultAboutContent();
  if (!stored || typeof stored !== "object") return defaults;

  return {
    ...defaults,
    ...stored,
    roots: Array.isArray(stored.roots) && stored.roots.length > 0 ? stored.roots : defaults.roots,
    values: Array.isArray(stored.values) ? stored.values : defaults.values,
    team: Array.isArray(stored.team) ? stored.team : defaults.team,
    timeline: Array.isArray(stored.timeline) ? stored.timeline : defaults.timeline,
  };
}
