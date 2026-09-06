import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { BACKDROPS, PORTRAITS } from '../assets';
import { Hud } from '../components/Hud';
import { SuspectCard } from '../components/SuspectCard';
import { Button, Dialog, Scene } from '../components/ui';
import { fill } from '../content/schema';
import { canAccuse, remainingSuspects } from '../game/machine';
import type { GameState, SuspectId } from '../game/types';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * The office floor: pick a workstation to inspect, or — once something has
 * actually been inspected — open the accusation flow.
 */
export function OfficeScreen({
  state,
  onOpenSuspect,
  onPropose,
  onCancel,
  onConfirm,
}: {
  state: GameState;
  onOpenSuspect: (suspect: SuspectId) => void;
  onPropose: (suspect: SuspectId) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { story, t } = useLanguage();
  const day = story.days[String(state.day) as '1' | '2' | '3'];
  const [choosing, setChoosing] = useState(false);
  // Firing gets its own beat before the day rolls over, so the consequence
  // registers instead of flashing past.
  const [firing, setFiring] = useState<SuspectId | null>(null);
  const suspects = remainingSuspects(state);
  const accusable = canAccuse(state);

  const pendingName = state.pendingAccusation
    ? story.characters[state.pendingAccusation].name
    : '';

  return (
    <Scene backdrop={BACKDROPS.office} overlay="bg-ground/78">
      <Hud state={state} />

      <div className="flex flex-1 flex-col justify-center gap-8 py-8">
        <p className="text-center text-sm text-ink-dim sm:text-base">{day.office.hint}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {suspects.map((id, index) => (
            <SuspectCard
              key={id}
              suspect={id}
              index={index}
              investigated={state.visited[id]}
              onSelect={() => onOpenSuspect(id)}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            tone={accusable ? 'danger' : 'ghost'}
            disabled={!accusable}
            onClick={() => setChoosing(true)}
            sfx="click"
          >
            {t('accuse')}
          </Button>
          {!accusable && <p className="max-w-md text-center text-sm text-warn">{day.office.blockedBody}</p>}
        </div>
      </div>

      {/* Step 1: who? */}
      <Dialog open={choosing} onClose={() => setChoosing(false)} labelledBy="choose-title">
        <h2 id="choose-title" className="text-xl font-semibold">
          {t('chooseTitle')}
        </h2>
        <p className="mt-2 text-ink-dim">{t('chooseBody')}</p>

        <ul className="mt-5 flex flex-col gap-2">
          {suspects.map((id) => (
            <li key={id}>
              <Button
                tone="ghost"
                sfx="select"
                className="w-full justify-start"
                onClick={() => {
                  setChoosing(false);
                  onPropose(id);
                }}
              >
                {fill(story.ui.chooseOption, { name: story.characters[id].name })}
              </Button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <Button tone="quiet" sfx="click" onClick={() => setChoosing(false)}>
            {t('confirmCancel')}
          </Button>
        </div>
      </Dialog>

      {/* Step 2: are you sure? Firing is irreversible, so it always asks. */}
      <Dialog
        open={state.pendingAccusation != null && firing == null}
        onClose={onCancel}
        labelledBy="confirm-title"
      >
        <h2 id="confirm-title" className="text-xl font-semibold text-alarm">
          {t('confirmTitle')}
        </h2>
        <p className="mt-3 leading-relaxed text-ink-dim">
          {fill(story.ui.confirmBody, { name: pendingName })}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button tone="ghost" sfx="click" onClick={onCancel}>
            {t('confirmCancel')}
          </Button>
          <Button
            tone="danger"
            sfx="fired"
            onClick={() => {
              const suspect = state.pendingAccusation;
              if (!suspect) return;
              setFiring(suspect);
              setTimeout(onConfirm, 1900);
            }}
          >
            {t('confirmAccept')}
          </Button>
        </div>
      </Dialog>

      <AnimatePresence>
        {firing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-ground px-6"
            role="status"
          >
            <div className="flex max-w-xl flex-col items-center gap-5 text-center">
              <motion.img
                src={PORTRAITS[firing]}
                alt=""
                aria-hidden="true"
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="h-44 w-auto object-contain grayscale"
              />
              <motion.p
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="font-mono text-2xl tracking-[0.3em] text-alarm uppercase"
              >
                {story.characters[firing].name}
              </motion.p>
              <p className="leading-relaxed text-ink-dim">{t('firedNotice')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Scene>
  );
}
