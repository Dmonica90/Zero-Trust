import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BACKDROPS, MARCUS } from '../assets';
import { useSound } from '../audio/SoundProvider';
import { Button, Scene, Typewriter } from '../components/ui';
import { fill } from '../content/schema';
import { accusationBefore } from '../game/machine';
import type { GameState } from '../game/types';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * Timings lifted from the published course (`legacy/story_content/user.js`,
 * Script182/183). The day card is a Majora's Mask nod and the beat only lands at
 * the original speed: the title grows from 1.5 and settles by 40%, holds to 80%,
 * then fades — 3.5s in all — and the black ground fades over the second after.
 */
const BANNER_TEXT_MS = 3500;
const BANNER_FADE_MS = 1000;
const BANNER_TOTAL_MS = BANNER_TEXT_MS + BANNER_FADE_MS;

/** Where the bubble sits on the 1920x1080 desk scene, as a share of it. */
const BUBBLE = { left: `${(933 / 1920) * 100}%`, top: `${(584 / 1080) * 100}%` };

type Beat = 'banner' | 'bubble' | 'message';

export function AlertScreen({ state, onContinue }: { state: GameState; onContinue: () => void }) {
  const { story, t } = useLanguage();
  const { play } = useSound();
  const reduceMotion = useReducedMotion();
  const day = story.days[String(state.day) as '1' | '2' | '3'];

  // Day 1 opens on the title screen, so only days 2 and 3 get the day card.
  const [beat, setBeat] = useState<Beat>(day.banner ? 'banner' : 'bubble');
  const [typed, setTyped] = useState(false);

  const previous = accusationBefore(state, state.day);
  const firedName = previous ? story.characters[previous.suspect].name : '';
  const reason = previous ? (day.alert.reasons?.[previous.suspect] ?? '') : '';
  const body = fill(day.alert.body, { name: firedName });

  useEffect(() => {
    if (beat !== 'banner') return;
    play('day');
    const id = setTimeout(() => setBeat('bubble'), reduceMotion ? 900 : BANNER_TOTAL_MS);
    return () => clearTimeout(id);
  }, [beat, play, reduceMotion]);

  useEffect(() => {
    if (beat === 'bubble') play('notification');
    if (beat === 'message') play('alert');
  }, [beat, play]);

  return (
    <>
      <Scene backdrop={beat === 'message' ? BACKDROPS.alertMarcus : BACKDROPS.alert} overlay="bg-ground/55">
        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            {beat === 'bubble' ? (
              <motion.button
                key="bubble"
                type="button"
                onClick={() => setBeat('message')}
                aria-label={`${day.alert.label}: ${t('openMessage')}`}
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: reduceMotion ? 0 : [0, -10, 10, -10, 0] }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ scale: { duration: 0.25 }, rotate: { duration: 1, delay: 0.25 } }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={BUBBLE}
              >
                <span className="absolute inset-0 -m-4 animate-ping rounded-full bg-accent/25" aria-hidden="true" />
                <img
                  src={BACKDROPS.notificationIcon}
                  alt=""
                  aria-hidden="true"
                  className="relative h-16 w-auto drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)] sm:h-24"
                />
                <span className="mt-3 block rounded-lg bg-panel/90 px-3 py-1 font-mono text-[0.7rem] tracking-wide text-accent uppercase">
                  {t('openMessage')}
                </span>
              </motion.button>
            ) : beat === 'message' ? (
              <motion.div
                key="message"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="panel relative z-10 w-full max-w-2xl rounded-2xl p-6 sm:p-9"
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alarm opacity-70" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-alarm" />
                  </span>
                  <p className="font-mono text-sm tracking-[0.22em] text-alarm uppercase">{day.alert.label}</p>
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
            ) : null}
          </AnimatePresence>

          {beat === 'message' && (
            <img
              src={MARCUS.thinking}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute right-0 bottom-0 hidden h-[62vh] object-contain 2xl:block"
            />
          )}
        </div>
      </Scene>

      <AnimatePresence>
        {beat === 'banner' && day.banner && (
          <motion.div
            key="banner"
            className="fixed inset-0 z-40 grid place-items-center bg-ground"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: BANNER_FADE_MS / 1000, delay: BANNER_TEXT_MS / 1000 }}
          >
            <motion.p
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [1.5, 1, 1, 1] }}
              transition={{ duration: BANNER_TEXT_MS / 1000, times: [0, 0.4, 0.8, 1], ease: 'easeOut' }}
              className="px-6 text-center text-4xl font-semibold tracking-[0.14em] uppercase sm:text-6xl"
            >
              {day.banner}
            </motion.p>
            <button
              type="button"
              onClick={() => setBeat('bubble')}
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
