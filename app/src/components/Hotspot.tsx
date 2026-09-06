import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageProvider';
import type { SuspectId } from '../game/types';

/**
 * The magnifier badge over a desk. The published course drew a green hexagon
 * with a magnifying glass inside a soft purple glow; this is that mark, redrawn
 * as a real button so it works by tap and by keyboard as well as by mouse.
 */
export function DeskMark({
  suspect,
  onSelect,
  done,
  label,
}: {
  suspect: SuspectId;
  onSelect: () => void;
  /** Already investigated today: the mark stays, greyed, and stops responding. */
  done: boolean;
  label: string;
}) {
  const { story } = useLanguage();
  const name = story.characters[suspect].name;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={done}
      aria-label={`${name}. ${label}`}
      whileHover={done ? undefined : { scale: 1.12 }}
      whileTap={done ? undefined : { scale: 0.95 }}
      className="group relative grid place-items-center disabled:cursor-not-allowed"
    >
      {!done && (
        <span
          className="absolute h-14 w-14 animate-ping rounded-full bg-accent/25 sm:h-20 sm:w-20"
          aria-hidden="true"
        />
      )}
      <span
        aria-hidden="true"
        className={`relative grid h-11 w-11 place-items-center transition-colors sm:h-14 sm:w-14 ${
          done ? 'text-ink-dim/50' : 'text-safe drop-shadow-[0_0_14px_rgba(61,220,151,0.55)]'
        }`}
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      >
        <span
          className={`absolute inset-0 ${done ? 'bg-panel-2/80' : 'bg-safe/25 group-hover:bg-safe/40'}`}
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="relative h-5 w-5 sm:h-6 sm:w-6">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" strokeLinecap="round" />
        </svg>
      </span>

      <span
        className={`mt-1.5 block rounded-md px-2 py-0.5 font-mono text-[0.6rem] tracking-wide uppercase sm:text-[0.7rem] ${
          done ? 'bg-panel/70 text-ink-dim' : 'bg-panel/85 text-ink'
        }`}
      >
        {name}
      </span>
    </motion.button>
  );
}

/**
 * A seat at the meeting table. Pressing it opens that person's statement in a
 * bubble anchored where they sit.
 */
export function SeatMark({
  suspect,
  onSelect,
  quote,
  label,
}: {
  suspect: SuspectId;
  onSelect: () => void;
  quote?: string;
  label: string;
}) {
  const { story } = useLanguage();
  const name = story.characters[suspect].name;

  if (quote) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="panel w-44 rounded-2xl p-3 text-left sm:w-56 sm:p-4"
      >
        <p className="font-mono text-[0.65rem] tracking-wide text-accent uppercase">{name}</p>
        <p className="mt-1 text-xs leading-relaxed sm:text-sm">“{quote}”</p>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={`${name}. ${label}`}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="panel flex items-center gap-2 rounded-full px-3 py-2"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      <span className="font-mono text-[0.7rem] tracking-wide uppercase">{name}</span>
    </motion.button>
  );
}
