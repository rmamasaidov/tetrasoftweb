export type SectorKey = 'gov' | 'enterprise' | 'industry' | 'healthcare' | 'agro' | 'education';

export const SECTOR_LABELS: Record<SectorKey, string> = {
  gov: 'Государственный сектор',
  enterprise: 'Корпоративные системы',
  industry: 'Промышленность',
  healthcare: 'Здравоохранение',
  agro: 'Агропромышленность',
  education: 'Образование',
};

/** Short label used inside small UI chips (≤14 chars). */
export const SECTOR_SHORT: Record<SectorKey, string> = {
  gov: 'Государство',
  enterprise: 'Бизнес',
  industry: 'Промышленность',
  healthcare: 'Медицина',
  agro: 'АПК',
  education: 'Образование',
};

/** Visual gradient key used by .project-card--{key} CSS in PortfolioCard. */
export const SECTOR_VISUAL: Record<SectorKey, 'gov' | 'industry' | 'edu' | 'health'> = {
  gov: 'gov',
  enterprise: 'industry',
  industry: 'industry',
  healthcare: 'health',
  agro: 'industry',
  education: 'edu',
};

/** Tabler-style icon name used in the card visual band. */
export const SECTOR_ICON: Record<SectorKey, string> = {
  gov: 'shield-check',
  enterprise: 'building-skyscraper',
  industry: 'building-skyscraper',
  healthcare: 'stethoscope',
  agro: 'tractor',
  education: 'school',
};
