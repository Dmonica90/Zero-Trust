import type { SuspectId } from './game/types';

/**
 * Where things sit on the original 1920x1080 artwork.
 *
 * The published course laid the office and the meeting out as a fixed canvas
 * and scaled the whole thing to fit, so the hotspots always lined up with the
 * people in the picture. These are those positions, read out of the slide data
 * and expressed as a share of the canvas, so a scaled stage can do the same.
 */

export const CANVAS = { width: 1920, height: 1080 } as const;

type Point = { left: string; top: string };

const at = (x: number, y: number, w: number, h: number): Point => ({
  left: `${((x + w / 2) / CANVAS.width) * 100}%`,
  top: `${((y + h / 2) / CANVAS.height) * 100}%`,
});

/** The magnifier hexagons over each desk (79x87 in `5VjbxBUGHJf`). */
export const OFFICE_MARKS: Record<SuspectId, Point> = {
  leo: at(333, 475, 79, 87),
  omar: at(703, 414, 79, 87),
  sara: at(1050, 598, 79, 87),
  mia: at(1566, 594, 79, 87),
};

/** The speech bubbles around the table (350x225 in `6JRPSXjSqBo`). */
export const MEETING_MARKS: Record<SuspectId, Point> = {
  mia: at(194, 151, 350, 225),
  omar: at(593, 117, 350, 225),
  leo: at(1112, 117, 350, 225),
  sara: at(1514, 195, 350, 225),
};
