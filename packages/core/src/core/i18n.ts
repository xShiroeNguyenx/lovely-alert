/** Localizable strings for built-in button / aria labels. */
export interface Locale {
  confirm: string
  deny: string
  cancel: string
  closeAriaLabel: string
}

const locales: Record<string, Locale> = {
  en: { confirm: 'OK', deny: 'No', cancel: 'Cancel', closeAriaLabel: 'Close this dialog' },
  vi: { confirm: 'Đồng ý', deny: 'Không', cancel: 'Huỷ', closeAriaLabel: 'Đóng hộp thoại' },
}

let currentLocale = 'en'

export function setLocale(name: string): void {
  if (locales[name]) currentLocale = name
}

export function getLocaleName(): string {
  return currentLocale
}

export function defineLocale(name: string, strings: Locale): void {
  locales[name] = strings
}

/** The active locale's strings (falls back to English). */
export function t(): Locale {
  return locales[currentLocale] ?? locales.en
}
