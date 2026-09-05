export const SUSPECT_IDS = ['leo', 'sara', 'omar', 'mia'] as const;
export type SuspectId = (typeof SUSPECT_IDS)[number];

/** The infiltrator. Accusing them is the only winning move. */
export const CULPRIT: SuspectId = 'mia';

export type Day = 1 | 2 | 3;

/**
 * Which screen the player is on. `investigating` is the zoomed-in workstation
 * view; the suspect being looked at lives in `GameState.investigating`.
 */
export type Phase = 'title' | 'alert' | 'meeting' | 'office' | 'investigating' | 'ended';

/**
 * How the run finished. The three winning outcomes differ only by how many days
 * it took — the earlier the catch, the less data left the network.
 */
export type Outcome = 'architect' | 'neutralized' | 'saved' | 'compromised';

export type SuspectFlags = Record<SuspectId, boolean>;

/** One line in the player's evidence log, accumulated across the whole run. */
export type EvidenceEntry = {
  day: Day;
  suspect: SuspectId;
  /** True once the player asked the follow-up question, not just looked. */
  questioned: boolean;
};

export type Accusation = { day: Day; suspect: SuspectId };

export type GameState = {
  day: Day;
  phase: Phase;
  investigating: SuspectId | null;
  /** Workstations opened on the *current* day. Resets when the day advances. */
  visited: SuspectFlags;
  /** Suspects still employed. A wrong accusation clears one. */
  active: SuspectFlags;
  accusations: Accusation[];
  evidence: EvidenceEntry[];
  outcome: Outcome | null;
  /**
   * True while the "are you sure?" dialog is open; holds who is about to be
   * fired so the confirmation can name them.
   */
  pendingAccusation: SuspectId | null;
  /** Set when the player tries to accuse straight from the meeting. */
  showBlockedHint: boolean;
};

export type GameAction =
  | { type: 'start' }
  | { type: 'gatherTeam' }
  | { type: 'goToOffice' }
  | { type: 'openSuspect'; suspect: SuspectId }
  | { type: 'questionSuspect' }
  | { type: 'closeSuspect' }
  | { type: 'attemptAccuseFromMeeting' }
  | { type: 'dismissBlockedHint' }
  | { type: 'proposeAccusation'; suspect: SuspectId }
  | { type: 'cancelAccusation' }
  | { type: 'confirmAccusation' }
  | { type: 'restart' };
