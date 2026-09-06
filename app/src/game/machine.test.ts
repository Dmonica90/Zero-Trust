import { describe, expect, it } from 'vitest';
import { canAccuse, canOpen, initialState, reducer, remainingSuspects } from './machine';
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

describe('the opening', () => {
  it('plays the cinematic before the first alert', () => {
    const started = reducer(initialState, { type: 'start' });
    expect(started.phase).toBe('intro');
    expect(reducer(started, { type: 'introDone' }).phase).toBe('alert');
  });
});

describe('outcomes', () => {
  it('accusing Mia on day 1 earns the best rank', () => {
    const end = playDay(run([{ type: 'start' }, { type: 'introDone' }]), 'mia');
    expect(end.phase).toBe('ended');
    expect(end.outcome).toBe('architect');
    expect(end.day).toBe(1);
  });

  it('accusing Mia on day 2 neutralizes the threat', () => {
    const day2 = playDay(run([{ type: 'start' }, { type: 'introDone' }]), 'leo');
    expect(day2.day).toBe(2);
    expect(day2.phase).toBe('alert');
    expect(playDay(day2, 'mia').outcome).toBe('neutralized');
  });

  it('accusing Mia on day 3 still saves the system', () => {
    let s = run([{ type: 'start' }, { type: 'introDone' }]);
    s = playDay(s, 'leo');
    s = playDay(s, 'sara');
    expect(s.day).toBe(3);
    expect(playDay(s, 'mia').outcome).toBe('saved');
  });

  it('firing all three innocents loses the run', () => {
    let s = run([{ type: 'start' }, { type: 'introDone' }]);
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
    const s = playDay(run([{ type: 'start' }, { type: 'introDone' }]), 'omar');
    expect(s.active.omar).toBe(false);
    expect(s.day).toBe(2);
    expect(s.phase).toBe('alert');
    expect(s.accusations).toEqual([{ day: 1, suspect: 'omar' }]);
  });

  it('clears the visited workstations so they can be re-investigated', () => {
    const s = playDay(run([{ type: 'start' }, { type: 'introDone' }]), 'leo');
    expect(s.visited).toEqual({ leo: false, sara: false, omar: false, mia: false });
    expect(s.investigating).toBeNull();
  });

  it('keeps the evidence log across days', () => {
    let s = playDay(run([{ type: 'start' }, { type: 'introDone' }]), 'leo');
    s = playDay(s, 'sara');
    expect(s.evidence).toEqual([
      { day: 1, suspect: 'leo', questioned: true },
      { day: 2, suspect: 'sara', questioned: true },
    ]);
  });
});

describe('accusation gating', () => {
  it('blocks accusing from the meeting before anything is investigated', () => {
    const s = run([
      { type: 'start' },
      { type: 'introDone' },
      { type: 'gatherTeam' },
      { type: 'attemptAccuseFromMeeting' },
    ]);
    expect(s.showBlockedHint).toBe(true);
    expect(s.phase).toBe('meeting');
  });

  it('lets the player through once a workstation has been opened', () => {
    const s = run([
      { type: 'start' },
      { type: 'introDone' },
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
      { type: 'introDone' },
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
      run([{ type: 'start' }, { type: 'introDone' }]),
    );
    expect(s.pendingAccusation).toBeNull();
    expect(s.active.leo).toBe(true);
    expect(s.accusations).toEqual([]);
  });

  it('cannot open or accuse a suspect who was already fired', () => {
    const day2 = playDay(run([{ type: 'start' }, { type: 'introDone' }]), 'leo');
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
    let s = run([{ type: 'start' }, { type: 'introDone' }, { type: 'gatherTeam' }, { type: 'goToOffice' }]);
    s = reducer(s, { type: 'openSuspect', suspect: 'sara' });
    expect(s.evidence).toEqual([{ day: 1, suspect: 'sara', questioned: false }]);

    s = reducer(s, { type: 'questionSuspect' });
    expect(s.evidence).toEqual([{ day: 1, suspect: 'sara', questioned: true }]);
  });

  it('keeps one entry per suspect per day', () => {
    let s = run([{ type: 'start' }, { type: 'introDone' }, { type: 'gatherTeam' }, { type: 'goToOffice' }]);
    s = run(
      [
        { type: 'openSuspect', suspect: 'omar' },
        { type: 'questionSuspect' },
        { type: 'closeSuspect' },
      ],
      s,
    );
    expect(s.evidence).toEqual([{ day: 1, suspect: 'omar', questioned: true }]);
  });
});

describe('one visit per suspect per day', () => {
  const atOffice = () => run([{ type: 'start' }, { type: 'introDone' }, { type: 'gatherTeam' }, { type: 'goToOffice' }]);

  it('closes a workstation once it has been looked at', () => {
    let s = atOffice();
    expect(canOpen(s, 'sara')).toBe(true);

    s = run([{ type: 'openSuspect', suspect: 'sara' }, { type: 'closeSuspect' }], s);
    expect(canOpen(s, 'sara')).toBe(false);

    // A second attempt changes nothing at all.
    expect(reducer(s, { type: 'openSuspect', suspect: 'sara' })).toBe(s);
  });

  it('leaves the other workstations open', () => {
    const s = run([{ type: 'openSuspect', suspect: 'sara' }, { type: 'closeSuspect' }], atOffice());
    expect(canOpen(s, 'leo')).toBe(true);
    expect(canOpen(s, 'mia')).toBe(true);
  });

  it('opens them all again the next day', () => {
    const day2 = playDay(run([{ type: 'start' }, { type: 'introDone' }]), 'leo', 'sara');
    expect(day2.day).toBe(2);
    for (const id of remainingSuspects(day2)) expect(canOpen(day2, id)).toBe(true);
  });
});

describe('moving between the meeting and the office', () => {
  it('goes back to the team without losing what was found', () => {
    let s = run([
      { type: 'start' },
      { type: 'introDone' },
      { type: 'gatherTeam' },
      { type: 'goToOffice' },
      { type: 'openSuspect', suspect: 'mia' },
      { type: 'questionSuspect' },
      { type: 'closeSuspect' },
      { type: 'backToMeeting' },
    ]);
    expect(s.phase).toBe('meeting');
    expect(s.investigating).toBeNull();
    expect(s.evidence).toEqual([{ day: 1, suspect: 'mia', questioned: true }]);

    // And back out again, with Mia's desk still spent and the rest open.
    s = reducer(s, { type: 'goToOffice' });
    expect(s.phase).toBe('office');
    expect(canOpen(s, 'mia')).toBe(false);
    expect(canOpen(s, 'omar')).toBe(true);
  });
});

describe('restart', () => {
  it('returns to a pristine state after a loss', () => {
    let s = run([{ type: 'start' }, { type: 'introDone' }]);
    s = playDay(s, 'leo');
    s = playDay(s, 'sara');
    s = playDay(s, 'omar');
    expect(reducer(s, { type: 'restart' })).toEqual(initialState);
  });
});
