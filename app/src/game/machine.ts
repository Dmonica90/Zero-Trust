import { CULPRIT, SUSPECT_IDS } from './types';
import type { Day, GameAction, GameState, SuspectFlags, SuspectId } from './types';

/**
 * Pure game logic. Deliberately free of React and of content: the reducer only
 * moves the player between phases and records decisions, while every string
 * lives in the story JSON. That split is what makes a fourth day (or a different
 * culprit) a content edit rather than a rewrite.
 */

const allSuspects = (value: boolean): SuspectFlags => ({
  leo: value,
  sara: value,
  omar: value,
  mia: value,
});

/** Winning on day 1 is the best rank; each extra day costs more data. */
const WIN_BY_DAY = { 1: 'architect', 2: 'neutralized', 3: 'saved' } as const;

export const initialState: GameState = {
  day: 1,
  phase: 'title',
  investigating: null,
  visited: allSuspects(false),
  active: allSuspects(true),
  accusations: [],
  evidence: [],
  outcome: null,
  pendingAccusation: null,
  showBlockedHint: false,
};

/** Suspects the player can still look at and accuse today. */
export function remainingSuspects(state: GameState): SuspectId[] {
  return SUSPECT_IDS.filter((id) => state.active[id]);
}

/** The meeting gates accusing until at least one workstation has been opened. */
export function canAccuse(state: GameState): boolean {
  return remainingSuspects(state).some((id) => state.visited[id]);
}

export function investigatedCount(state: GameState): number {
  return remainingSuspects(state).filter((id) => state.visited[id]).length;
}

/**
 * How far the extraction has progressed, as the story tells it: the team reports
 * 80% on day 2 and the player stops it at 99% on day 3.
 */
export function threatLevel(day: Day): number {
  return { 1: 35, 2: 80, 3: 99 }[day];
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start':
      return { ...state, phase: 'alert' };

    case 'gatherTeam':
      return { ...state, phase: 'meeting' };

    case 'goToOffice':
      return { ...state, phase: 'office', showBlockedHint: false };

    case 'openSuspect': {
      if (!state.active[action.suspect]) return state;
      return {
        ...state,
        phase: 'investigating',
        investigating: action.suspect,
        visited: { ...state.visited, [action.suspect]: true },
        evidence: upsertEvidence(state, action.suspect, false),
      };
    }

    case 'questionSuspect': {
      if (state.investigating == null) return state;
      return { ...state, evidence: upsertEvidence(state, state.investigating, true) };
    }

    case 'closeSuspect':
      return { ...state, phase: 'office', investigating: null };

    case 'attemptAccuseFromMeeting':
      return canAccuse(state)
        ? { ...state, phase: 'office', showBlockedHint: false }
        : { ...state, showBlockedHint: true };

    case 'dismissBlockedHint':
      return { ...state, showBlockedHint: false };

    case 'proposeAccusation': {
      if (!state.active[action.suspect] || !canAccuse(state)) return state;
      return { ...state, pendingAccusation: action.suspect };
    }

    case 'cancelAccusation':
      return { ...state, pendingAccusation: null };

    case 'confirmAccusation': {
      const suspect = state.pendingAccusation;
      if (suspect == null) return state;

      const accusations = [...state.accusations, { day: state.day, suspect }];

      if (suspect === CULPRIT) {
        return {
          ...state,
          phase: 'ended',
          outcome: WIN_BY_DAY[state.day],
          accusations,
          pendingAccusation: null,
        };
      }

      const active = { ...state.active, [suspect]: false };

      // Out of days: the infiltrator finishes the transfer.
      if (state.day === 3) {
        return {
          ...state,
          phase: 'ended',
          outcome: 'compromised',
          accusations,
          active,
          pendingAccusation: null,
        };
      }

      // A new day: the alert reports yesterday's mistake and the workstations
      // are worth looking at again, so `visited` starts clean.
      return {
        ...state,
        day: (state.day + 1) as Day,
        phase: 'alert',
        investigating: null,
        visited: allSuspects(false),
        active,
        accusations,
        pendingAccusation: null,
        showBlockedHint: false,
      };
    }

    case 'restart':
      return { ...initialState };

    default:
      return state;
  }
}

/**
 * Evidence is keyed by day + suspect so re-opening a workstation does not
 * duplicate the entry, but asking the follow-up question upgrades it.
 */
function upsertEvidence(state: GameState, suspect: SuspectId, questioned: boolean) {
  const index = state.evidence.findIndex((e) => e.day === state.day && e.suspect === suspect);
  if (index === -1) {
    return [...state.evidence, { day: state.day, suspect, questioned }];
  }
  if (!questioned || state.evidence[index].questioned) return state.evidence;

  const next = [...state.evidence];
  next[index] = { ...next[index], questioned: true };
  return next;
}

/** The accusation that sent the story into the given day, if there was one. */
export function accusationBefore(state: GameState, day: Day) {
  return state.accusations.find((a) => a.day === day - 1) ?? null;
}
