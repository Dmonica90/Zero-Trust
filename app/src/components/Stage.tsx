import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import { CANVAS } from '../scene';

/**
 * A 16:9 stage that scales to fit, with the backdrop drawn whole rather than
 * cropped. Anything placed on it by percentage stays glued to the same spot in
 * the artwork at every window size — which is what makes clicking on a person in
 * the scene reliable.
 *
 * A phone in portrait would shrink this to a stamp, so the screens that use it
 * show a stacked list instead below `lg`; this is the wide-screen half.
 */
export function Stage({
  backdrop,
  children,
  className = '',
}: {
  backdrop: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto w-full ${className}`} style={{ maxWidth: 'min(100%, 160vh)' }}>
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-edge"
        style={{ aspectRatio: `${CANVAS.width} / ${CANVAS.height}` }}
      >
        <img src={backdrop} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ground/35" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

/** Places one control at a point on the stage, centred on it. */
export function Mark({
  at,
  children,
  delay = 0,
}: {
  at: CSSProperties;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={at}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
