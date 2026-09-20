import { CLINIC } from "@/i18n/clinic";
import { createContext, useContext, useEffect, useState, useRef, useId, type ReactNode } from 'react';
import messages from '../../public/translations.json';

export const locales = [{ code: 'hy', label: 'Հայ', path: '/hy' }, { code: 'ru', label: 'Рус', path: '/ru' }, { code: 'en', label: 'Eng', path: '/en' }] as const;
export type Language = typeof locales[number]['code'];
export const STORAGE_KEY = 'aurevia.language';
export const isLanguage = (value: unknown): value is Language => locales.some(({ code }) => code === value);
type Params = Record<string, string | number>;
export function translate(language: Language, key: string, params: Params = {}) {
  const catalog = messages as Record<string, Record<Language, string>>;
  return (catalog[key]?.[language] ?? key).replace(/\{(\w+)\}/g, (match, name) => String(params[name] ?? match));
}
const LanguageContext = createContext({ language: 'hy' as Language, setLanguage: (_language: Language) => {}, t: (key: string, params?: Params) => translate('hy', key, params) });
export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Deterministic Armenian SSR; restore the browser preference after hydration.
  const [language, updateLanguage] = useState<Language>('hy');
  useEffect(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (isLanguage(saved)) updateLanguage(saved); } catch { /* Storage may be disabled. */ }
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY && isLanguage(event.newValue)) updateLanguage(event.newValue); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const setLanguage = (next: Language) => {
    updateLanguage(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* Switching still works without storage. */ }
  };
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(language, '{clinic} — Demo Website', {clinic: CLINIC.name});
    const description = translate(language, 'A premium U.S. concept for modern dental care, including implants, porcelain veneers, clear aligners, preventive care, and digital diagnostics.');
    const ogDescription = translate(language, 'Advanced care, thoughtful design, and a dental experience built around the person.');
    document.querySelectorAll<HTMLMetaElement>('meta[name="description"]').forEach(meta => { meta.content = description; });
    document.querySelectorAll<HTMLMetaElement>('meta[property="og:title"]').forEach(meta => { meta.content = document.title; });
    document.querySelectorAll<HTMLMetaElement>('meta[property="og:description"]').forEach(meta => { meta.content = ogDescription; });
  }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t: (key, params) => translate(language, key, params) }}>{children}</LanguageContext.Provider>;
}

export function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const names = { hy: 'Հայերեն', ru: 'Русский', en: 'English' };
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);
  return <div ref={root} className={`language-switcher${mobile ? ' language-switcher-mobile' : ''}`}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => { if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} type="button" className="language-trigger" aria-expanded={open} aria-controls={panelId}
      aria-label={`${t('Language')}: ${names[language]}`} onClick={() => setOpen(value => !value)}>
      {mobile && <span className="language-caption">{t('Language')}</span>}
      <span lang={language}>{locales.find(locale => locale.code === language)?.label}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1" /></svg>
    </button>
    {open && <div id={panelId} className="language-options" role="group" aria-label={t('Language')}>
      {locales.map(({ code, label }) => <button key={code} type="button" lang={code} aria-label={names[code]} aria-pressed={language === code}
        onClick={() => { setLanguage(code); setOpen(false); trigger.current?.focus(); }}>
        <span>{label}</span><span className="language-option-name">{names[code]}</span>
      </button>)}
    </div>}
  </div>;
}
