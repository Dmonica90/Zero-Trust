import { describe, expect, it } from 'vitest';
import { canAccuse, initialState, reducer, remainingSuspects } from './machine';
import type { GameAction, GameState, SuspectId } from './types';

const run = (actions: GameAction[], from: GameState = initialState) =>
  actions.reduce(reducer, from);

/** Play one full day: reach the office, look at a workstation, fire `suspect`. */
const playDay = (state: GameState, suspect: SuspectId, look: SuspectId = suspect) =>
  run(
    [
      { type: 'gatherTeam' },
      { type: 'goToOffice' },
      { type: 'openSuspect', suspect: look },
      { type: 'questionSuspect' },
      { type: 'closeSuspect' },
      { type: 'proposeAccusation', suspect },
      { type: 'confirmAccusation' },
    ],
    state,
  );

describe('outcomes', () => {
  it('accusing Mia on day 1 earns the best rank', () => {
    const end = playDay(reducer(initialState, { type: 'start' }), 'mia');
    expect(end.phase).toBe('ended');
    expect(end.outcome).toBe('architect');
    expect(end.day).toBe(1);
  });

  it('accusing Mia on day 2 neutralizes the threat', () => {
    const day2 = playDay(reducer(initialState, { type: 'start' }), 'leo');
    expect(day2.day).toBe(2);
    expect(day2.phase).toBe('alert');
    expect(playDay(day2, 'mia').outcome).toBe('neutralized');
  });

  it('accusing Mia on day 3 still saves the system', () => {
    let s = reducer(initialState, { type: 'start' });
    s = playDay(s, 'leo');
    s = playDay(s, 'sara');
    expect(s.day).toBe(3);
    expect(playDay(s, 'mia').outcome).toBe('saved');
  });

  it('firing all three innocents loses the run', () => {
    let s = reducer(initialState, { type: 'start' });
    s = playDay(s, 'leo');
    s = playDay(s, 'sara');
    s = playDay(s, 'omar');
    expect(s.phase).toBe('ended');
    expect(s.outcome).toBe('compromised');
    expect(remainingSuspects(s)).toEqual(['mia']);
  });
});

describe('day transitions', () => {
  it('a wrong accusation deactivates the suspect and opens the next day', () => {
    const s = playDay(reducer(initialState, { type: 'start' }), 'omar');
    expect(s.active.omar).toBe(false);
    expect(s.day).toBe(2);
    expect(s.phase).toBe('alert');
    expect(s.accusations).toEqual([{ day: 1, suspect: 'omar' }]);
  });

  it('clears the visited workstations so they can be re-investigated', () => {
    const s = playDay(reducer(initialState, { type: 'start' }), 'leo');
    expect(s.visited).toEqual({ leo: false, sara: false, omar: false, mia: false });
    expect(s.investigating).toBeNull();
  });

  it('keeps the evidence log across days', () => {
    let s = playDay(reducer(initialState, { type: 'start' }), 'leo');
    s = playDay(s, 'sara');
    expect(s.evidence).toEqual([
      { day: 1, suspect: 'leo', questioned: true },
      { day: 2, suspect: 'sara', questioned: true },
    ]);
  });
});

describe('accusation gating', () => {
  it('blocks accusing from the meeting before anything is investigated', () => {
    const s = run([{ type: 'start' }, { type: 'gatherTeam' }, { type: 'attemptAccuseFromMeeting' }]);
    expect(s.showBlockedHint).toBe(true);
    expect(s.phase).toBe('meeting');
  });

  it('lets the player through once a workstation has been opened', () => {
    const s = run([
      { type: 'start' },
      { type: 'gatherTeam' },
      { type: 'goToOffice' },
      { type: 'openSuspect', suspect: 'mia' },
      { type: 'closeSuspect' },
      { type: 'attemptAccuseFromMeeting' },
    ]);
    expect(s.showBlockedHint).toBe(false);
    expect(s.phase).toBe('office');
  });

  it('ignores an accusation proposed before any investigation', () => {
    const s = run([
      { type: 'start' },
      { type: 'gatherTeam' },
      { type: 'goToOffice' },
      { type: 'proposeAccusation', suspect: 'mia' },
    ]);
    expect(s.pendingAccusation).toBeNull();
    expect(canAccuse(s)).toBe(false);
  });

  it('cancelling leaves everyone employed', () => {
    const s = run(
      [
        { type: 'gatherTeam' },
        { type: 'goToOffice' },
        { type: 'openSuspect', suspect: 'leo' },
        { type: 'closeSuspect' },
        { type: 'proposeAccusation', suspect: 'leo' },
        { type: 'cancelAccusation' },
      ],
      reducer(initialState, { type: 'start' }),
    );
    expect(s.pendingAccusation).toBeNull();
    expect(s.active.leo).toBe(true);
    expect(s.accusations).toEqual([]);
  });

  it('cannot open or accuse a suspect who was already fired', () => {
    const day2 = playDay(reducer(initialState, { type: 'start' }), 'leo');
    const opened = reducer(day2, { type: 'openSuspect', suspect: 'leo' });
    expect(opened).toBe(day2);

    const proposed = reducer(
      { ...day2, phase: 'office', visited: { ...day2.visited, mia: true } },
      { type: 'proposeAccusation', suspect: 'leo' },
    );
    expect(proposed.pendingAccusation).toBeNull();
  });
});

describe('evidence log', () => {
  it('records a look, then upgrades it when the follow-up is asked', () => {
    let s = run([{ type: 'start' }, { type: 'gatherTeam' }, { type: 'goToOffice' }]);
    s = reducer(s, { type: 'openSuspect', suspect: 'sara' });
    expect(s.evidence).toEqual([{ day: 1, suspect: 'sara', questioned: false }]);

    s = reducer(s, { type: 'questionSuspect' });
    expect(s.evidence).toEqual([{ day: 1, suspect: 'sara', questioned: true }]);
  });

  it('does not duplicate an entry when a workstation is revisited', () => {
    let s = run([{ type: 'start' }, { type: 'gatherTeam' }, { type: 'goToOffice' }]);
    s = run(
      [
        { type: 'openSuspect', suspect: 'omar' },
        { type: 'questionSuspect' },
        { type: 'closeSuspect' },
        { type: 'openSuspect', suspect: 'omar' },
      ],
      s,
    );
    expect(s.evidence).toEqual([{ day: 1, suspect: 'omar', questioned: true }]);
  });
});

describe('restart', () => {
  it('returns to a pristine state after a loss', () => {
    let s = reducer(initialState, { type: 'start' });
    s = playDay(s, 'leo');
    s = playDay(s, 'sara');
    s = playDay(s, 'omar');
    expect(reducer(s, { type: 'restart' })).toEqual(initialState);
  });
});
