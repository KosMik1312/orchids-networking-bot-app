import { ru, type Translations } from './ru';

// Пока только русский, позже добавим другие языки
export const translations: Record<string, Translations> = {
  ru,
};

// Текущий язык (в будущем можно менять динамически)
let currentLocale = 'ru';

export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations[currentLocale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value ?? key;
}

export function setLocale(locale: string) {
  if (translations[locale]) {
    currentLocale = locale;
  }
}

export function getLocale(): string {
  return currentLocale;
}

export { ru };
