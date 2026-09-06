import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { BACKDROPS, PORTRAITS } from '../assets';
import { useSound } from '../audio/SoundProvider';
import { Button, Scene, Stagger, StaggerItem } from '../components/ui';
import { CULPRIT } from '../game/types';
import type { GameState, Outcome } from '../game/types';
import { useLanguage } from '../i18n/LanguageProvider';

const IS_WIN: Record<Outcome, boolean> = {
  architect: true,
  neutralized: true,
  saved: true,
  compromised: false,
};

/**
 * The debrief. Beyond the original course's closing text, it replays the
 * decisions that got the player here — the part that turns a result into a
 * lesson.
 */
export function EndingScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const { story, t } = useLanguage();
  const { play } = useSound();
  const outcome = state.outcome ?? 'compromised';
  const ending = story.endings[outcome];
  const won = IS_WIN[outcome];

  // A loss always comes from a day-3 accusation. Say why that person was not the
  // one either, instead of ending on the generic screen.
  const lastCall = state.accusations.at(-1);
  const defeatReason =
    !won && lastCall ? (story.days['3'].defeatReasons?.[lastCall.suspect] ?? '') : '';

  // Only the defeat has a sound of its own; the published course played nothing
  // but the generic click on a win, so a win stays quiet here too.
  useEffect(() => {
    if (!won) play('lose');
  }, [won, play]);

  return (
    <Scene
      backdrop={won ? BACKDROPS.endingWin : BACKDROPS.endingCircuit}
      overlay={won ? 'bg-ground/82' : 'bg-ground/90'}
    >
      <div className="relative flex flex-1 items-center justify-center py-10">
        <Stagger>
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <StaggerItem>
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.2 }}
                className={`inline-block rounded-full border px-5 py-2 font-mono text-sm tracking-[0.16em] uppercase ${
                  won ? 'border-safe/60 bg-safe/10 text-safe' : 'border-alarm/60 bg-alarm/10 text-alarm'
                }`}
              >
                {ending.badge}
              </motion.p>
            </StaggerItem>

            <StaggerItem>
              <h1
                className={`text-3xl font-bold tracking-tight sm:text-5xl ${
                  won ? 'text-safe' : 'text-alarm'
                }`}
              >
                {ending.headline}
              </h1>
            </StaggerItem>

            {defeatReason && (
              <StaggerItem>
                <p className="border-l-2 border-warn pl-4 text-base leading-relaxed text-warn">
                  {defeatReason}
                </p>
              </StaggerItem>
            )}

            <StaggerItem>
              <p className="text-lg leading-relaxed">{ending.body}</p>
            </StaggerItem>

            {ending.rank && (
              <StaggerItem>
                <motion.p
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.5 }}
                  className="inline-block rounded-full border border-accent/60 bg-accent/10 px-5 py-2 font-mono text-sm tracking-wide text-accent"
                >
                  {ending.rank}
                </motion.p>
              </StaggerItem>
            )}

            <StaggerItem>
              <div className="panel rounded-2xl p-6">
                <p className="leading-relaxed text-ink-dim">{ending.lesson}</p>
              </div>
            </StaggerItem>

            {state.accusations.length > 0 && (
              <StaggerItem>
                <div className="panel rounded-2xl p-6">
                  <h2 className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                    {t('decisionsTitle')}
                  </h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    {state.accusations.map((accusation) => {
                      const character = story.characters[accusation.suspect];
                      const correct = accusation.suspect === CULPRIT;
                      return (
                        <li key={accusation.day} className="flex items-center gap-3">
                          <img
                            src={PORTRAITS[accusation.suspect]}
                            alt=""
                            aria-hidden="true"
                            className="h-12 w-auto object-contain"
                          />
                          <span className="font-mono text-xs text-ink-dim">
                            {t('dayShort', { day: String(accusation.day) })}
                          </span>
                          <span className="font-medium">{character.name}</span>
                          <span
                            className={`ml-auto font-mono text-xs ${
                              correct ? 'text-safe' : 'text-alarm'
                            }`}
                          >
                            {correct ? '✓' : '✕'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </StaggerItem>
            )}

            <StaggerItem>
              <Button onClick={onRestart} sfx="confirm" className="px-8 py-3 text-lg">
                {t('playAgain')}
              </Button>
            </StaggerItem>
          </div>
        </Stagger>
      </div>
    </Scene>
  );
}
