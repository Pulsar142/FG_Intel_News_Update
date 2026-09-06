export type ArticleImage = {
  url: string;
  caption: string;
  sourceUrl: string;
};

export type ArticleSource = {
  name: string;
  url: string;
};

export type ArticleInput = {
  slug: string;
  title: string;
  region: "SINGAPORE" | "SEA" | "GLOBAL" | "USA" | "MALAYSIA" | "INDONESIA" | "CUSTOM";
  country?: string;
  summaryP1: string;
  summaryP2: string;
  didYouKnow: string;
  perspective: string;
  bullets: string[];
  images: ArticleImage[];
  sources: ArticleSource[];
  reliabilityScore: number;
  articleDate?: Date;
  weekOf: Date;
};
