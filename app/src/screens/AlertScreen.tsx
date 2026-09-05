import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BACKDROPS, MARCUS } from '../assets';
import { useSound } from '../audio/SoundProvider';
import { Button, Scene, Typewriter } from '../components/ui';
import { fill } from '../content/schema';
import { accusationBefore } from '../game/machine';
import type { GameState } from '../game/types';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * The incident alert that opens every day. On days 2 and 3 it also delivers the
 * consequence of the previous decision: who was fired, and why that was wrong.
 */
export function AlertScreen({ state, onContinue }: { state: GameState; onContinue: () => void }) {
  const { story, t } = useLanguage();
  const { play } = useSound();
  const day = story.days[String(state.day) as '1' | '2' | '3'];

  const [showBanner, setShowBanner] = useState(day.banner != null);
  const [typed, setTyped] = useState(false);

  const previous = accusationBefore(state, state.day);
  const firedName = previous ? story.characters[previous.suspect].name : '';
  const reason = previous ? (day.alert.reasons?.[previous.suspect] ?? '') : '';
  const body = fill(day.alert.body, { name: firedName });

  useEffect(() => {
    if (showBanner) return;
    play('alert');
  }, [showBanner, play]);

  // The day card is a beat, not a wall: it clears itself after a moment.
  useEffect(() => {
    if (!showBanner) return;
    const id = setTimeout(() => setShowBanner(false), 2600);
    return () => clearTimeout(id);
  }, [showBanner]);

  return (
    <>
      <Scene backdrop={BACKDROPS.alertMarcus} overlay="bg-ground/65">
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: showBanner ? 2.4 : 0.15 }}
            className="panel relative z-10 w-full max-w-2xl rounded-2xl p-6 sm:p-9"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alarm opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-alarm" />
              </span>
              <p className="font-mono text-sm tracking-[0.22em] text-alarm uppercase">
                {day.alert.label}
              </p>
            </div>

            <div aria-live="polite" className="mt-5 flex flex-col gap-4">
              <Typewriter
                text={body}
                className="text-lg leading-relaxed sm:text-xl"
                onDone={() => setTyped(true)}
              />
              {reason && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: typed ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="border-l-2 border-warn pl-4 text-base leading-relaxed text-warn"
                >
                  {reason}
                </motion.p>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={onContinue} sfx="select">
                {day.alert.cta}
              </Button>
            </div>
          </motion.div>

          <img
            src={MARCUS.thinking}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 bottom-0 hidden h-[62vh] object-contain 2xl:block"
          />
        </div>
      </Scene>

      <AnimatePresence>
        {showBanner && day.banner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-40 grid place-items-center bg-ground"
          >
            <motion.p
              initial={{ opacity: 0, scale: 1.35 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="px-6 text-center text-4xl font-semibold tracking-[0.14em] uppercase sm:text-6xl"
            >
              {day.banner}
            </motion.p>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="absolute right-5 bottom-5 min-h-11 rounded-xl px-4 text-sm text-ink-dim hover:text-ink"
            >
              {t('skip')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
