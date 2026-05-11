export type SeoPageItem = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export const SEO_PAGES: SeoPageItem[] = [
  {
    slug: 'hantavirus-map',
    title: 'Hantavirus Map Live Tracker 2026',
    h1: 'Hantavirus Map Live Tracker',
    description:
      'Track ANDV Hantavirus 2026 signals with a live independent map showing confirmed, suspected, deceased and monitoring cases.',
    keywords: ['hantavirus map', 'hantavirus tracker', 'hantavirus live map'],
    sections: [
      {
        title: 'Live Hantavirus map',
        body: 'This page provides a focused map experience for ANDV Hantavirus 2026 tracking. The dashboard summarizes confirmed, suspected, deceased and monitoring signals from public map data.',
      },
      {
        title: 'Independent tracking signal',
        body: 'The tracker is designed for public awareness and search visibility. It is not a medical authority and should not replace official health guidance.',
      },
    ],
  },
  {
    slug: 'hantavirus-outbreak-2026',
    title: 'Hantavirus Outbreak 2026 Updates',
    h1: 'Hantavirus Outbreak 2026 Updates',
    description:
      'Follow Hantavirus outbreak 2026 updates, live case signals, country pages, map data and source links.',
    keywords: ['hantavirus outbreak 2026', 'hantavirus cases 2026'],
    sections: [
      {
        title: 'Current outbreak tracking',
        body: 'The dashboard tracks public signals related to Hantavirus and ANDV in 2026, including country-level pages and individual case pages generated from the latest data.',
      },
      {
        title: 'What the numbers mean',
        body: 'Confirmed, suspected, deceased and monitoring values are treated separately to avoid mixing verified cases with early signals.',
      },
    ],
  },
  {
    slug: 'andv-hantavirus-2026',
    title: 'ANDV Hantavirus 2026 Live Tracker',
    h1: 'ANDV Hantavirus 2026 Live Tracker',
    description:
      'Independent ANDV Hantavirus 2026 tracker with map, case categories, countries, sources and live updates.',
    keywords: ['ANDV hantavirus', 'ANDV hantavirus 2026'],
    sections: [
      {
        title: 'ANDV tracking',
        body: 'ANDV Hantavirus tracking pages help users find a clear summary of locations, categories and public source signals.',
      },
      {
        title: 'Updated map data',
        body: 'The data pipeline checks the primary public map source and falls back to official sources if the primary source cannot be read.',
      },
    ],
  },
  {
    slug: 'mv-hondius-hantavirus',
    title: 'MV Hondius Hantavirus Tracker',
    h1: 'MV Hondius Hantavirus Tracker',
    description:
      'Track MV Hondius Hantavirus related signals, cruise ship updates, monitoring locations and public source links.',
    keywords: ['MV Hondius hantavirus', 'hantavirus cruise ship'],
    sections: [
      {
        title: 'Cruise ship related signals',
        body: 'This page targets searches related to MV Hondius and cruise ship Hantavirus signals. It links the broader dashboard with specific monitoring and case data.',
      },
      {
        title: 'Travel-related context',
        body: 'Travel-related signals can involve multiple countries and locations, so the tracker separates location pages from the live case map.',
      },
    ],
  },
  {
    slug: 'hantavirus-cruise-ship',
    title: 'Hantavirus Cruise Ship Tracker',
    h1: 'Hantavirus Cruise Ship Tracker',
    description:
      'Live independent tracker for Hantavirus cruise ship related signals, suspected cases, confirmed cases and monitoring locations.',
    keywords: ['hantavirus cruise ship', 'cruise ship hantavirus'],
    sections: [
      {
        title: 'Cruise ship outbreak tracking',
        body: 'Cruise ship related health signals spread across multiple countries and ports. This page gives users a search-friendly landing page for the latest tracker data.',
      },
      {
        title: 'Public source tracking',
        body: 'All signals should be treated as public tracking information, not as medical advice.',
      },
    ],
  },
  {
    slug: 'hantavirus-symptoms',
    title: 'Hantavirus Symptoms and Tracker',
    h1: 'Hantavirus Symptoms and Live Tracker',
    description:
      'Learn about Hantavirus symptom searches and follow live tracker pages for outbreak-related public signals.',
    keywords: ['hantavirus symptoms', 'hantavirus signs'],
    sections: [
      {
        title: 'Symptoms search intent',
        body: 'Many users search for Hantavirus symptoms during outbreaks. This page connects symptom-related search intent with the live tracker and source pages.',
      },
      {
        title: 'Medical disclaimer',
        body: 'This site does not diagnose, treat or provide medical advice. Users should consult official health agencies and healthcare professionals.',
      },
    ],
  },
  {
    slug: 'hantavirus-deaths',
    title: 'Hantavirus Deaths Tracker 2026',
    h1: 'Hantavirus Deaths Tracker',
    description:
      'Track reported deceased-category Hantavirus signals separately from confirmed, suspected and monitoring categories.',
    keywords: ['hantavirus deaths', 'hantavirus death tracker'],
    sections: [
      {
        title: 'Deaths category',
        body: 'The tracker separates deceased-category signals from confirmed and suspected case categories so users can understand the data structure clearly.',
      },
      {
        title: 'Independent signal',
        body: 'Deceased-category tracking is based on public source signals and should be verified with official health updates.',
      },
    ],
  },
  {
    slug: 'hantavirus-confirmed-cases',
    title: 'Hantavirus Confirmed Cases Tracker',
    h1: 'Hantavirus Confirmed Cases Tracker',
    description:
      'Track confirmed Hantavirus case signals by country, map point and latest update page.',
    keywords: ['hantavirus confirmed cases', 'confirmed hantavirus'],
    sections: [
      {
        title: 'Confirmed case signals',
        body: 'Confirmed signals are counted separately from suspected and monitoring categories to keep the dashboard more transparent.',
      },
      {
        title: 'Country pages',
        body: 'Each affected location can generate a country page with totals, map links and latest case data.',
      },
    ],
  },
  {
    slug: 'hantavirus-suspected-cases',
    title: 'Hantavirus Suspected Cases Tracker',
    h1: 'Hantavirus Suspected Cases Tracker',
    description:
      'Track suspected Hantavirus case signals, monitoring updates and country pages from public map data.',
    keywords: ['hantavirus suspected cases', 'suspected hantavirus'],
    sections: [
      {
        title: 'Suspected cases',
        body: 'Suspected cases are not treated as confirmed. The tracker keeps suspected values separate for clarity.',
      },
      {
        title: 'Live updates',
        body: 'The data pipeline updates on a schedule and refreshes generated JSON files for the frontend.',
      },
    ],
  },
  {
    slug: 'hantavirus-monitoring-cases',
    title: 'Hantavirus Monitoring Cases Tracker',
    h1: 'Hantavirus Monitoring Cases Tracker',
    description:
      'Track Hantavirus monitoring, quarantine and observation signals from public map data.',
    keywords: ['hantavirus monitoring', 'hantavirus quarantine'],
    sections: [
      {
        title: 'Monitoring status',
        body: 'Monitoring signals can include quarantine, isolation or observation categories shown separately from suspected and confirmed cases.',
      },
      {
        title: 'Map focus',
        body: 'The map can highlight selected countries or locations when users interact with the side list.',
      },
    ],
  },
  {
    slug: 'hantavirus-live-updates',
    title: 'Hantavirus Live Updates',
    h1: 'Hantavirus Live Updates',
    description:
      'Follow live Hantavirus updates, generated country pages, case pages and trend articles.',
    keywords: ['hantavirus live updates', 'hantavirus update today'],
    sections: [
      {
        title: 'Live update hub',
        body: 'This page is a search landing page for users looking for the latest Hantavirus updates and live tracker information.',
      },
      {
        title: 'Automatic publishing',
        body: 'Each data refresh can generate updated JSON, country pages, case pages and latest update pages.',
      },
    ],
  },
  {
    slug: 'hantavirus-tracker',
    title: 'Hantavirus Tracker',
    h1: 'Hantavirus Tracker',
    description:
      'Independent Hantavirus tracker with map, categories, source links and automatic updates.',
    keywords: ['hantavirus tracker', 'live hantavirus tracker'],
    sections: [
      {
        title: 'Tracker overview',
        body: 'The tracker combines map data, category counts and generated SEO pages to help users find outbreak-related information.',
      },
      {
        title: 'Source transparency',
        body: 'The site clearly labels its primary and fallback data sources.',
      },
    ],
  },
  {
    slug: 'hantavirus-cases-by-country',
    title: 'Hantavirus Cases by Country',
    h1: 'Hantavirus Cases by Country',
    description:
      'View Hantavirus case signals by country and location with generated country pages and live map focus.',
    keywords: ['hantavirus by country', 'hantavirus cases by country'],
    sections: [
      {
        title: 'Country-level tracking',
        body: 'Country pages are generated from the latest data files, allowing Google to index location-specific search results.',
      },
      {
        title: 'Map and list interaction',
        body: 'Users can click a location in the side list and the map highlights the matching point.',
      },
    ],
  },
  {
    slug: 'hantavirus-source-links',
    title: 'Hantavirus Source Links',
    h1: 'Hantavirus Source Links',
    description:
      'Source links and data notes for the independent Hantavirus tracker.',
    keywords: ['hantavirus sources', 'hantavirus source links'],
    sections: [
      {
        title: 'Primary and fallback sources',
        body: 'The primary source is the public ArcGIS research dashboard. Fallback sources include official health agency feeds when the primary source fails.',
      },
      {
        title: 'Data notes',
        body: 'Users should verify health information with official authorities before making decisions.',
      },
    ],
  },
  {
    slug: 'andv-virus-map',
    title: 'ANDV Virus Map',
    h1: 'ANDV Virus Map',
    description:
      'ANDV virus live map and Hantavirus 2026 tracker with public case signals.',
    keywords: ['ANDV virus map', 'ANDV tracker'],
    sections: [
      {
        title: 'ANDV map',
        body: 'This landing page targets ANDV-specific searches and directs users to the live map and country-level data.',
      },
      {
        title: 'Independent dashboard',
        body: 'The tracker is independent and based on public source signals.',
      },
    ],
  },
  {
    slug: 'hantavirus-public-health-tracker',
    title: 'Hantavirus Public Health Tracker',
    h1: 'Hantavirus Public Health Tracker',
    description:
      'Public-health focused Hantavirus tracker with live map, source links and country pages.',
    keywords: ['public health hantavirus', 'hantavirus public health'],
    sections: [
      {
        title: 'Public health search hub',
        body: 'This page helps users searching public-health related Hantavirus terms find the live tracker and source links.',
      },
      {
        title: 'Not medical advice',
        body: 'The dashboard does not provide diagnosis, treatment or official medical guidance.',
      },
    ],
  },
  {
    slug: 'hantavirus-news-tracker',
    title: 'Hantavirus News Tracker',
    h1: 'Hantavirus News Tracker',
    description:
      'Track Hantavirus news signals, map updates and generated latest update pages.',
    keywords: ['hantavirus news', 'hantavirus latest news'],
    sections: [
      {
        title: 'News and map signals',
        body: 'The site combines live map data with generated update pages for search visibility.',
      },
      {
        title: 'Trend pages',
        body: 'Trend pages can target fast-moving searches while the dashboard remains focused on verified categories.',
      },
    ],
  },
  {
    slug: 'hantavirus-alert-map',
    title: 'Hantavirus Alert Map',
    h1: 'Hantavirus Alert Map',
    description:
      'Hantavirus alert map for confirmed, suspected, deceased and monitoring signals.',
    keywords: ['hantavirus alert map', 'hantavirus alerts'],
    sections: [
      {
        title: 'Alert-style tracking',
        body: 'This page targets alert-related search intent and points users to the live map interface.',
      },
      {
        title: 'Data categories',
        body: 'The tracker separates confirmed, suspected, deceased and monitoring categories.',
      },
    ],
  },
  {
    slug: 'hantavirus-data-dashboard',
    title: 'Hantavirus Data Dashboard',
    h1: 'Hantavirus Data Dashboard',
    description:
      'Data dashboard for Hantavirus map signals, country pages, source links and latest update pages.',
    keywords: ['hantavirus dashboard', 'hantavirus data'],
    sections: [
      {
        title: 'Data dashboard',
        body: 'The dashboard is built around static JSON files that can be updated automatically and deployed cheaply.',
      },
      {
        title: 'Static performance',
        body: 'Static JSON and generated pages help keep hosting costs low while improving SEO coverage.',
      },
    ],
  },
  {
    slug: 'hantavirus-independent-tracker',
    title: 'Independent Hantavirus Tracker',
    h1: 'Independent Hantavirus Tracker',
    description:
      'Independent Hantavirus tracker using public map data, country pages and source links.',
    keywords: ['independent hantavirus tracker', 'hantavirus independent map'],
    sections: [
      {
        title: 'Independent tracker',
        body: 'This site is not an official health agency. It organizes public signals into a readable map and searchable pages.',
      },
      {
        title: 'SEO structure',
        body: 'Generated country, case and topic pages allow the site to capture different search intents.',
      },
    ],
  },
];