import ru from './ru.json';

const dictionaries = { ru } as const;

export type Locale = keyof typeof dictionaries;

export function t(locale: Locale, key: string): string {
  const dict = dictionaries[locale] as Record<string, string>;
  return dict[key] ?? key;
}
