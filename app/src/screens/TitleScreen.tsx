import { motion } from 'framer-motion';
import { BACKDROPS, TITLE_ART } from '../assets';
import { Button, Scene } from '../components/ui';
import { LOCALES, STORIES } from '../content';
import type { Locale } from '../content';
import { useLanguage } from '../i18n/LanguageProvider';

export function TitleScreen({ onStart }: { onStart: () => void }) {
  const { story, t, locale, setLocale } = useLanguage();

  return (
    <Scene backdrop={BACKDROPS.office} overlay="bg-ground/88">
      <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="flex flex-col items-center gap-3"
        >
          <h1 className="sr-only">
            {story.title.line1} {story.title.line2}
          </h1>
          <img src={TITLE_ART.line1} alt="" aria-hidden="true" className="w-[min(80vw,34rem)]" />
          <img src={TITLE_ART.line2} alt="" aria-hidden="true" className="w-[min(74vw,31rem)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col items-center gap-6"
        >
          <Button onClick={onStart} sfx="confirm" className="px-10 py-3.5 text-lg">
            {t('start')}
          </Button>

          <div className="flex items-center gap-1 rounded-full border border-edge bg-panel/70 p-1">
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code as Locale)}
                aria-pressed={locale === code}
                className={`min-h-11 rounded-full px-4 text-sm transition-colors ${
                  locale === code ? 'bg-accent text-ground font-semibold' : 'text-ink-dim hover:text-ink'
                }`}
              >
                {STORIES[code].languageName}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </Scene>
  );
}
