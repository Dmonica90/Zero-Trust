import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { PORTRAITS, deskImage } from '../assets';
import { Button, Scene } from '../components/ui';
import { fill } from '../content/schema';
import type { GameState, SuspectId } from '../game/types';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * The zoomed-in workstation. The backdrop scales in slightly to sell the "lean
 * closer" beat that the original course did with a slide transition.
 */
export function InvestigateScreen({
  state,
  suspect,
  onQuestion,
  onBack,
}: {
  state: GameState;
  suspect: SuspectId;
  onQuestion: () => void;
  onBack: () => void;
}) {
  const { story, t } = useLanguage();
  const day = story.days[String(state.day) as '1' | '2' | '3'];
  const scene = day.investigations[suspect];
  const character = story.characters[suspect];
  const [asked, setAsked] = useState(false);

  const ask = () => {
    setAsked(true);
    onQuestion();
  };

  return (
    <Scene backdrop={deskImage(suspect, state.day)} overlay="bg-ground/55" zoomBackdrop>
      <div className="flex flex-1 items-end justify-center pb-6 sm:items-center sm:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="panel w-full max-w-2xl rounded-2xl p-6 sm:p-8"
        >
          <p className="text-lg leading-relaxed sm:text-xl">{scene.observation}</p>

          <AnimatePresence>
            {asked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mt-6 flex flex-col gap-4 border-t border-edge pt-6">
                  <p className="leading-relaxed text-accent">{scene.question}</p>
                  <div className="flex items-start gap-4">
                    <img
                      src={PORTRAITS[suspect]}
                      alt=""
                      aria-hidden="true"
                      className="hidden h-24 w-auto object-contain sm:block"
                    />
                    <p className="leading-relaxed">
                      <span className="font-semibold">{character.name}: </span>
                      {scene.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button tone="ghost" sfx="click" onClick={onBack}>
              {t('back')}
            </Button>
            {!asked && (
              <Button sfx="select" onClick={ask}>
                {fill(story.ui.question, { name: character.name })}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </Scene>
  );
}
