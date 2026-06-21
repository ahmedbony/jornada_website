export const RESOURCE_TYPES = [
  { key: "guides", label: "Guides", count: 28 },
  { key: "case-studies", label: "Case studies", count: 17 },
  { key: "tools", label: "Tools / calculators", count: 14 },
  { key: "funding", label: "Funding programs", count: 22 },
  { key: "data", label: "Data / dashboards", count: 11 },
  { key: "extension", label: "Extension / research", count: 19 },
];

export const RESOURCES = [
  {
    id: "openet",
    icon: "💧",
    title: "OpenET",
    description: "Free evapotranspiration data and tools for water management.",
    tags: ["Tools / calculators", "Data", "Irrigation efficiency"],
    type: "tools",
  },
  {
    id: "nrcs-funding",
    icon: "🏛",
    title: "NRCS funding opportunities",
    description: "Find and apply for NRCS financial assistance programs.",
    tags: ["Funding programs", "NRCS", "Conservation"],
    type: "funding",
  },
  {
    id: "wata-case-studies",
    icon: "📄",
    title: "WATA case studies",
    description: "Real-world examples of adaptation strategies from California growers.",
    tags: ["Case studies", "Adaptation", "California"],
    type: "case-studies",
  },
  {
    id: "irrigation-guide",
    icon: "🌱",
    title: "Irrigation scheduling guide",
    description: "Step-by-step guide to improving irrigation scheduling on your farm.",
    tags: ["Guides", "Irrigation efficiency", "On-farm"],
    type: "guides",
  },
];
