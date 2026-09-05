import type { Day, SuspectId } from './game/types';

/**
 * Paths into `public/assets`, produced by `npm run assets`. Kept in one place so
 * a re-export from the source artwork only has to be reconciled here.
 */
const img = (name: string) => `${import.meta.env.BASE_URL}assets/img/${name}`;
const audio = (name: string) => `${import.meta.env.BASE_URL}assets/audio/${name}`;

export const BACKDROPS = {
  alert: img('bg-alert.webp'),
  alertMarcus: img('bg-alert-marcus.webp'),
  meeting: img('bg-meeting.webp'),
  office: img('bg-office.webp'),
  endingWin: img('bg-ending-win.webp'),
  endingCircuit: img('bg-ending-circuit.webp'),
};

export const TITLE_ART = {
  line1: img('title-zero-trust.webp'),
  line2: img('title-the-infiltrator.webp'),
};

export const MARCUS = {
  thinking: img('marcus-thinking.webp'),
  explaining: img('marcus-explaining.webp'),
};

export const PORTRAITS: Record<SuspectId, string> = {
  leo: img('portrait-leo.webp'),
  sara: img('portrait-sara.webp'),
  omar: img('portrait-omar.webp'),
  mia: img('portrait-mia.webp'),
};

/**
 * Only Mia's desk changes across the three days — that escalation is the visual
 * tell the game is teaching players to notice.
 */
export function deskImage(suspect: SuspectId, day: Day): string {
  if (suspect === 'mia') return img(`desk-mia-day${day}.webp`);
  return img(`desk-${suspect}.webp`);
}

export const SFX = {
  click: audio('ui-click.mp3'),
  select: audio('ui-select.mp3'),
  back: audio('ui-back.mp3'),
  open: audio('ui-open.mp3'),
  confirm: audio('ui-confirm.mp3'),
  alert: audio('sfx-alert.mp3'),
  fired: audio('sfx-fired.mp3'),
  win: audio('sfx-win.mp3'),
  lose: audio('sfx-lose.mp3'),
} as const;

export type SfxName = keyof typeof SFX;

/**
 * The 7-second clip from the original course. It only backs the losing ending,
 * so it is never preloaded — a player who wins never pays for it.
 */
export const INTRO_VIDEO = `${import.meta.env.BASE_URL}assets/video/intro-glitch.mp4`;
