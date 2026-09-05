import { motion } from 'framer-motion';
import { PORTRAITS } from '../assets';
import { useLanguage } from '../i18n/LanguageProvider';
import type { SuspectId } from '../game/types';

/**
 * One team member, as a real button. The published course drove all of this off
 * `onrollover`, which never fires on a touch screen; here the card is the
 * control, so tap, click and Enter all do the same thing.
 */
export function SuspectCard({
  suspect,
  onSelect,
  investigated = false,
  disabled = false,
  quote,
  index = 0,
}: {
  suspect: SuspectId;
  onSelect: () => void;
  investigated?: boolean;
  disabled?: boolean;
  quote?: string;
  index?: number;
}) {
  const { story, t } = useLanguage();
  const character = story.characters[suspect];

  // The card is a composite control (portrait, name, role, badge, quote), so it
  // carries one explicit label instead of letting the badge order decide what a
  // screen reader announces first.
  const label = [
    character.name,
    character.role,
    investigated ? t('evidenceLooked') : null,
    quote,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-label={label}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 * index, ease: 'easeOut' }}
      whileHover={disabled ? undefined : { y: -6 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className="panel group relative flex w-full flex-col items-center gap-3 rounded-2xl p-4 text-center transition-colors hover:border-accent/70 disabled:opacity-35 disabled:hover:border-edge"
    >
      {investigated && (
        <span className="absolute top-3 right-3 rounded-full bg-safe/15 px-2.5 py-1 font-mono text-[0.68rem] text-safe">
          {t('evidenceLooked')}
        </span>
      )}

      <img
        src={PORTRAITS[suspect]}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="h-32 w-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] sm:h-40"
      />

      <span className="flex flex-col gap-0.5">
        <span className="text-lg font-semibold">{character.name}</span>
        <span className="font-mono text-[0.7rem] tracking-wide text-ink-dim uppercase">
          {character.role}
        </span>
      </span>

      {quote && <span className="text-sm leading-relaxed text-ink-dim">“{quote}”</span>}
    </motion.button>
  );
}
