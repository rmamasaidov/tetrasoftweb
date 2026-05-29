import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    shortDescription: z.string(),
    icon: z.string(),
    order: z.number(),
    targetClient: z.string(),
    featured: z.boolean().default(false),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    sector: z.enum(['gov', 'enterprise', 'industry', 'healthcare', 'agro', 'education']),
    client: z.string(),
    year: z.string(),
    dgu: z.string(),
    summary: z.string(),
    featured: z.boolean().default(false),
    award: z.string().optional(),
  }),
});

export const collections = { services, portfolio };
