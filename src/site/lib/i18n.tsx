"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Language = "en" | "fr" | "sw";

const STRINGS = {
  en: {
    nav: {
      home: "Home", about: "About", projects: "Projects", photos: "Photos",
      videos: "Videos", stories: "Stories", donate: "Donate", contact: "Contact",
    },
    hero: {
      eyebrow: "Rebuilding Lives · Democratic Republic of Congo",
      headline: "Bringing Hope, Education, and the Love of Christ",
      highlight: "One By One",
      sub: "Transforming communities in the DRC through Education, Entrepreneurship, and Spiritual Discipleship — one person at a time.",
      learnMore: "Learn More",
      support: "Support the Mission",
      scroll: "Scroll",
    },
    stats: {
      communities: "Communities Served", families: "Families Reached",
      education: "Education Projects", volunteers: "Volunteers",
    },
    mission: {
      eyebrow: "Our Mission",
      title: "Changing the World One Person at a Time",
      verse: "— Matthew 28:19 · \"Go and make disciples of all nations\"",
    },
    pillars: {
      eyebrow: "How We Serve",
      title: "Four Pillars of Transformation",
      items: {
        education: { title: "Education", desc: "Building schools, training teachers, and equipping every child with the tools to flourish." },
        entrepreneurship: { title: "Entrepreneurship", desc: "Equipping families with skills, micro-grants, and mentorship to build sustainable livelihoods." },
        discipleship: { title: "Spiritual Discipleship", desc: "Sharing the Gospel through Bible study, pastoral training, and church partnerships." },
        community: { title: "Community Development", desc: "Building infrastructure, clean water, and healthcare that lift entire communities." },
      },
    },
    projects: {
      eyebrow: "On the Ground", title: "Featured Projects", viewAll: "View All", readMore: "Read More",
    },
    stories: {
      eyebrow: "From the Field", title: "Stories & Updates", all: "All Stories",
    },
    cta: {
      eyebrow: "Every Gift Matters",
      title: "Your Gift Changes Lives in Congo",
      body: "$25 feeds a family · $50 puts a child in school · $100 funds a month of village ministry",
      give: "Give Now",
      learnAbout: "Learn About Us",
    },
    newsletter: {
      eyebrow: "Stay Connected",
      title: "Join Our Prayer Network",
      sub: "Receive monthly updates, field stories, and prayer requests.",
      subscribe: "Subscribe",
      placeholder: "Enter your email",
    },
    footer: {
      tagline: "Rebuilding communities through Education, Entrepreneurship, and Spiritual Discipleship — one person at a time.",
      quickLinks: "Quick Links", contact: "Contact", stayConnected: "Stay Connected",
      newsletterDesc: "Receive ministry updates, stories, and prayer requests directly to your inbox.",
      copyright: "All rights reserved.",
      madeWith: "Made with",
      forKingdom: "for the Kingdom",
    },
    donate: {
      hero: { eyebrow: "Every Gift Matters", title: "Give to Change a Life in Congo" },
      eyebrow: "What Your Gift Does", title: "Every Dollar Goes to the Field",
      oneTime: "One-Time", monthly: "Monthly Recurring", amount: "Amount",
      paymentMethod: "Payment Method", give: "Give", tax: "256-bit SSL · 100% to field · Tax-deductible",
      processing: "Processing...",
    },
    about: {
      eyebrow: "Who We Are", title: "About One By One Ministries",
      storyEyebrow: "How It Began", storyTitle: "A Vision Born in the Heart of Congo",
      vision: "Our Vision", mission: "Our Mission",
      valuesEyebrow: "What Drives Us", valuesTitle: "Our Core Values",
      leadershipEyebrow: "The Team", leadershipTitle: "Leadership",
      congoEyebrow: "Why Congo", congoTitle: "The DRC: Immense Need, Immense Promise",
      foundersEyebrow: "The Story Behind the Mission", foundersTitle: "Our Founders' Journey",
      foundersDesc: "One By One Ministries was born from the story of two people, two continents, and one calling.",
    },
    contact: {
      eyebrow: "Get in Touch", title: "Contact Us",
      formTitle: "Send Us a Message",
      name: "Full Name", email: "Email Address", subject: "Subject", message: "Message",
      send: "Send Message", success: "Message Received!", successSub: "Thank you for reaching out. We respond within 2–3 business days.",
      faqEyebrow: "Common Questions", faqTitle: "Frequently Asked Questions",
    },
    common: {
      loading: "Loading...", save: "Save", cancel: "Cancel", delete: "Delete",
      edit: "Edit", add: "Add", search: "Search...", close: "Close",
      publish: "Publish", draft: "Draft", live: "Live", active: "Active",
      completed: "Completed", pending: "Pending", approved: "Approved", rejected: "Rejected",
    },
  },

  fr: {
    nav: {
      home: "Accueil", about: "À Propos", projects: "Projets", photos: "Photos",
      videos: "Vidéos", stories: "Histoires", donate: "Faire un Don", contact: "Contact",
    },
    hero: {
      eyebrow: "Reconstruire des Vies · République Démocratique du Congo",
      headline: "Apporter l'Espoir, l'Éducation et l'Amour du Christ",
      highlight: "Un par Un",
      sub: "Transformer les communautés en RDC par l'Éducation, l'Entrepreneuriat et la Disciple du Christ — une personne à la fois.",
      learnMore: "En Savoir Plus",
      support: "Soutenir la Mission",
      scroll: "Défiler",
    },
    stats: {
      communities: "Communautés Servies", families: "Familles Atteintes",
      education: "Projets Éducatifs", volunteers: "Bénévoles",
    },
    mission: {
      eyebrow: "Notre Mission",
      title: "Changer le Monde Une Personne à la Fois",
      verse: "— Matthieu 28:19 · \"Allez, faites de toutes les nations des disciples\"",
    },
    pillars: {
      eyebrow: "Comment Nous Servons",
      title: "Quatre Piliers de Transformation",
      items: {
        education: { title: "Éducation", desc: "Construire des écoles, former des enseignants, et équiper chaque enfant pour s'épanouir." },
        entrepreneurship: { title: "Entrepreneuriat", desc: "Équiper les familles avec des compétences, des micro-subventions et du mentorat." },
        discipleship: { title: "Discipulat Spirituel", desc: "Partager l'Évangile par l'étude biblique, la formation pastorale et les partenariats ecclésiastiques." },
        community: { title: "Développement Communautaire", desc: "Construire des infrastructures, l'eau propre et la santé qui élèvent les communautés entières." },
      },
    },
    projects: {
      eyebrow: "Sur le Terrain", title: "Projets en Vedette", viewAll: "Voir Tout", readMore: "Lire Plus",
    },
    stories: {
      eyebrow: "Du Terrain", title: "Histoires & Mises à Jour", all: "Toutes les Histoires",
    },
    cta: {
      eyebrow: "Chaque Don Compte",
      title: "Votre Don Change des Vies au Congo",
      body: "25$ nourrit une famille · 50$ scolarise un enfant · 100$ finance un mois de ministère",
      give: "Donner Maintenant",
      learnAbout: "En Savoir Plus",
    },
    newsletter: {
      eyebrow: "Restez Connecté",
      title: "Rejoignez Notre Réseau de Prière",
      sub: "Recevez des nouvelles mensuelles, des histoires du terrain et des demandes de prière.",
      subscribe: "S'abonner",
      placeholder: "Votre adresse email",
    },
    footer: {
      tagline: "Reconstruire les communautés par l'Éducation, l'Entrepreneuriat et le Discipulat — une personne à la fois.",
      quickLinks: "Liens Rapides", contact: "Contact", stayConnected: "Restez Connecté",
      newsletterDesc: "Recevez les mises à jour du ministère, des histoires et des demandes de prière directement dans votre boîte mail.",
      copyright: "Tous droits réservés.",
      madeWith: "Fait avec",
      forKingdom: "pour le Royaume",
    },
    donate: {
      hero: { eyebrow: "Chaque Don Compte", title: "Donnez pour Changer une Vie au Congo" },
      eyebrow: "Ce que Fait Votre Don", title: "Chaque Dollar Va Sur le Terrain",
      oneTime: "Unique", monthly: "Mensuel Récurrent", amount: "Montant",
      paymentMethod: "Mode de Paiement", give: "Donner", tax: "SSL 256 bits · 100% sur le terrain · Déductible fiscalement",
      processing: "Traitement...",
    },
    about: {
      eyebrow: "Qui Nous Sommes", title: "À Propos de One By One Ministries",
      storyEyebrow: "Comment Tout a Commencé", storyTitle: "Une Vision née au Cœur du Congo",
      vision: "Notre Vision", mission: "Notre Mission",
      valuesEyebrow: "Ce qui Nous Anime", valuesTitle: "Nos Valeurs Fondamentales",
      leadershipEyebrow: "L'Équipe", leadershipTitle: "Leadership",
      congoEyebrow: "Pourquoi le Congo", congoTitle: "La RDC : Besoin Immense, Promesse Immense",
      foundersEyebrow: "L'Histoire Derrière la Mission", foundersTitle: "Le Parcours de Nos Fondateurs",
      foundersDesc: "One By One Ministries est né de l'histoire de deux personnes, deux continents et un seul appel.",
    },
    contact: {
      eyebrow: "Prenez Contact", title: "Contactez-Nous",
      formTitle: "Envoyez-nous un Message",
      name: "Nom Complet", email: "Adresse Email", subject: "Sujet", message: "Message",
      send: "Envoyer le Message", success: "Message Reçu !", successSub: "Merci de nous avoir contactés. Nous répondons sous 2–3 jours ouvrés.",
      faqEyebrow: "Questions Fréquentes", faqTitle: "Foire aux Questions",
    },
    common: {
      loading: "Chargement...", save: "Sauvegarder", cancel: "Annuler", delete: "Supprimer",
      edit: "Modifier", add: "Ajouter", search: "Rechercher...", close: "Fermer",
      publish: "Publier", draft: "Brouillon", live: "En Ligne", active: "Actif",
      completed: "Terminé", pending: "En Attente", approved: "Approuvé", rejected: "Rejeté",
    },
  },

  sw: {
    nav: {
      home: "Nyumbani", about: "Kuhusu", projects: "Miradi", photos: "Picha",
      videos: "Video", stories: "Hadithi", donate: "Toa Mchango", contact: "Mawasiliano",
    },
    hero: {
      eyebrow: "Kujenga Upya Maisha · Jamhuri ya Kidemokrasia ya Kongo",
      headline: "Kuleta Matumaini, Elimu na Upendo wa Kristo",
      highlight: "Mmoja Baada ya Mmoja",
      sub: "Kubadilisha jamii nchini DRC kupitia Elimu, Ujasiriamali na Ufundishaji wa Kiroho — mtu mmoja kwa wakati.",
      learnMore: "Jifunza Zaidi",
      support: "Unga Mkono Dhamira",
      scroll: "Sogeza",
    },
    stats: {
      communities: "Jamii Zilizohudumika", families: "Familia Zilizofikia",
      education: "Miradi ya Elimu", volunteers: "Wanaojitolea",
    },
    mission: {
      eyebrow: "Dhamira Yetu",
      title: "Kubadilisha Dunia Mtu Mmoja kwa Wakati",
      verse: "— Mathayo 28:19 · \"Nendeni mkafanye watu wa mataifa yote kuwa wanafunzi\"",
    },
    pillars: {
      eyebrow: "Jinsi Tunavyohudumu",
      title: "Nguzo Nne za Mabadiliko",
      items: {
        education: { title: "Elimu", desc: "Kujenga shule, kufunza walimu, na kuweka watoto wote na zana za kustawi." },
        entrepreneurship: { title: "Ujasiriamali", desc: "Kuwapatia familia ujuzi, mikopo midogo, na ushauri ili kujenga maisha endelevu." },
        discipleship: { title: "Ufundishaji wa Kiroho", desc: "Kushiriki Injili kupitia masomo ya Biblia, mafunzo ya kichungaji na ushirika wa kanisa." },
        community: { title: "Maendeleo ya Jamii", desc: "Kujenga miundombinu, maji safi na huduma za afya zinazoinua jamii nzima." },
      },
    },
    projects: {
      eyebrow: "Uwanjani", title: "Miradi Iliyoangaziwa", viewAll: "Ona Yote", readMore: "Soma Zaidi",
    },
    stories: {
      eyebrow: "Kutoka Uwanjani", title: "Hadithi & Masasisho", all: "Hadithi Zote",
    },
    cta: {
      eyebrow: "Kila Zawadi Inahusika",
      title: "Zawadi Yako Inabadilisha Maisha Kongo",
      body: "$25 hulisha familia · $50 humweka mtoto shuleni · $100 hugharamia huduma mwezi mmoja",
      give: "Toa Sasa",
      learnAbout: "Jifunze Kuhusu Sisi",
    },
    newsletter: {
      eyebrow: "Kaa Kuunganika",
      title: "Jiunge na Mtandao Wetu wa Maombi",
      sub: "Pokea masasisho ya kila mwezi, hadithi za uwanjani na maombi.",
      subscribe: "Jiandikishe",
      placeholder: "Ingiza barua pepe yako",
    },
    footer: {
      tagline: "Kujenga upya jamii kupitia Elimu, Ujasiriamali na Ufundishaji — mtu mmoja kwa wakati.",
      quickLinks: "Viungo vya Haraka", contact: "Mawasiliano", stayConnected: "Kaa Kuunganika",
      newsletterDesc: "Pokea masasisho ya huduma, hadithi na maombi moja kwa moja kwenye barua pepe yako.",
      copyright: "Haki zote zimehifadhiwa.",
      madeWith: "Imetengenezwa kwa",
      forKingdom: "kwa ajili ya Ufalme",
    },
    donate: {
      hero: { eyebrow: "Kila Zawadi Inahusika", title: "Toa ili Kubadilisha Maisha Kongo" },
      eyebrow: "Zawadi Yako Inafanya Nini", title: "Kila Dola Inakwenda Uwanjani",
      oneTime: "Mara Moja", monthly: "Kila Mwezi", amount: "Kiasi",
      paymentMethod: "Njia ya Malipo", give: "Toa", tax: "SSL 256-bit · 100% uwanjani · Inaweza Kukatwa Kodi",
      processing: "Inashughulikia...",
    },
    about: {
      eyebrow: "Sisi ni Nani", title: "Kuhusu One By One Ministries",
      storyEyebrow: "Jinsi Yote Ilianza", storyTitle: "Maono Yaliyozaliwa Moyoni mwa Kongo",
      vision: "Maono Yetu", mission: "Dhamira Yetu",
      valuesEyebrow: "Kinachokuendesha", valuesTitle: "Maadili Yetu ya Msingi",
      leadershipEyebrow: "Timu", leadershipTitle: "Uongozi",
      congoEyebrow: "Kwa Nini Kongo", congoTitle: "DRC: Haja Kubwa, Ahadi Kubwa",
      foundersEyebrow: "Hadithi Nyuma ya Dhamira", foundersTitle: "Safari ya Waanzilishi Wetu",
      foundersDesc: "One By One Ministries ilizaliwa kutoka hadithi ya watu wawili, mabara mawili na wito mmoja.",
    },
    contact: {
      eyebrow: "Wasiliana Nasi", title: "Mawasiliano",
      formTitle: "Tutumie Ujumbe",
      name: "Jina Kamili", email: "Barua Pepe", subject: "Mada", message: "Ujumbe",
      send: "Tuma Ujumbe", success: "Ujumbe Umepokelewa!", successSub: "Asante kwa kuwasiliana. Tunajibu ndani ya siku 2–3 za kazi.",
      faqEyebrow: "Maswali ya Kawaida", faqTitle: "Maswali Yanayoulizwa Mara Kwa Mara",
    },
    common: {
      loading: "Inapakia...", save: "Hifadhi", cancel: "Ghairi", delete: "Futa",
      edit: "Hariri", add: "Ongeza", search: "Tafuta...", close: "Funga",
      publish: "Chapisha", draft: "Rasimu", live: "Hai", active: "Inafanya Kazi",
      completed: "Imekamilika", pending: "Inasubiri", approved: "Imeidhinishwa", rejected: "Imekataliwa",
    },
  },
};

type DeepValue<T> = T extends string ? string : T extends object ? { [K in keyof T]: DeepValue<T[K]> } : string;
type StringsType = typeof STRINGS.en;

function getNestedValue(obj: any, path: string): string {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return path;
    current = current[part];
  }
  return typeof current === "string" ? current : path;
}

interface I18nCtx {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: string) => string;
}

const I18nContext = React.createContext<I18nCtx>({ language: "en", setLanguage: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("obom_lang") as Language | null;
      if (saved === "en" || saved === "fr" || saved === "sw") setLang(saved);
    } catch {}
  }, []);

  const setLanguage = useCallback((l: Language) => {
    setLang(l);
    try { localStorage.setItem("obom_lang", l); } catch {}
  }, []);

  const t = useCallback((key: string) => getNestedValue(STRINGS[language], key), [language]);

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

export const LANG_LABELS: Record<Language, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  fr: { label: "Français", flag: "🇫🇷" },
  sw: { label: "Kiswahili", flag: "🇨🇩" },
};
