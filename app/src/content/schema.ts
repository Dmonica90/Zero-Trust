import { SUSPECT_IDS } from '../game/types';
import type { Outcome, SuspectId } from '../game/types';

/**
 * Shape of a localized script. Everything the player reads lives here, so a new
 * language is a new JSON file and a fourth day is a new entry under `days`.
 */

export type Investigation = {
  /** What Marcus notices at the workstation. */
  observation: string;
  /** The question the player puts to the suspect. */
  question: string;
  /** How the suspect explains themselves. */
  answer: string;
};

export type DayContent = {
  /** Full-screen day card. Day 1 opens on the title instead, so it has none. */
  banner: string | null;
  alert: {
    label: string;
    /** May contain `{name}` — the person fired the day before. */
    body: string;
    /** Why yesterday's firing was wrong, keyed by who was fired. */
    reasons: Record<SuspectId, string> | null;
    cta: string;
  };
  meeting: {
    introTitle: string;
    introBody: string;
    hint: string;
    quotes: Record<SuspectId, string>;
  };
  office: {
    hint: string;
    blockedTitle: string;
    blockedBody: string;
  };
  investigations: Record<SuspectId, Investigation>;
};

export type EndingContent = {
  headline: string;
  body: string;
  lesson: string;
  /** Shown as a rank badge on the winning endings. */
  rank: string | null;
};

export type Story = {
  locale: string;
  languageName: string;
  title: { line1: string; line2: string };
  characters: Record<SuspectId, { name: string; role: string }>;
  ui: {
    start: string;
    /** Label on the chat bubble that opens the day's alert. */
    openMessage: string;
    gatherTeam: string;
    investigate: string;
    accuse: string;
    back: string;
    question: string;
    confirmTitle: string;
    /** Contains `{name}`. */
    confirmBody: string;
    confirmCancel: string;
    confirmAccept: string;
    chooseTitle: string;
    chooseBody: string;
    /** Contains `{name}`. */
    chooseOption: string;
    firedNotice: string;
    playAgain: string;
    dayLabel: string;
    dayShort: string;
    decisionsTitle: string;
    evidenceTitle: string;
    evidenceEmpty: string;
    evidenceLooked: string;
    evidenceQuestioned: string;
    threatLabel: string;
    investigatedLabel: string;
    languageLabel: string;
    muteOn: string;
    muteOff: string;
    skip: string;
    close: string;
  };
  days: Record<'1' | '2' | '3', DayContent>;
  endings: Record<Outcome, EndingContent>;
};

const OUTCOMES: Outcome[] = ['architect', 'neutralized', 'saved', 'compromised'];

/**
 * Structural check for a story file. Content is authored by hand in JSON, so a
 * missing translation should fail loudly in tests rather than render "undefined"
 * to a learner.
 */
export function validateStory(story: Story, label: string): string[] {
  const problems: string[] = [];
  const require = (value: unknown, where: string) => {
    if (typeof value !== 'string' || value.trim() === '') problems.push(`${label}: ${where}`);
  };

  for (const id of SUSPECT_IDS) {
    require(story.characters[id]?.name, `characters.${id}.name`);
    require(story.characters[id]?.role, `characters.${id}.role`);
  }
  for (const [key, value] of Object.entries(story.ui)) require(value, `ui.${key}`);

  for (const day of ['1', '2', '3'] as const) {
    const d = story.days[day];
    if (!d) {
      problems.push(`${label}: days.${day} missing`);
      continue;
    }
    require(d.alert?.label, `days.${day}.alert.label`);
    require(d.alert?.body, `days.${day}.alert.body`);
    require(d.alert?.cta, `days.${day}.alert.cta`);
    require(d.meeting?.introTitle, `days.${day}.meeting.introTitle`);
    require(d.meeting?.introBody, `days.${day}.meeting.introBody`);
    require(d.meeting?.hint, `days.${day}.meeting.hint`);
    require(d.office?.hint, `days.${day}.office.hint`);
    require(d.office?.blockedTitle, `days.${day}.office.blockedTitle`);
    require(d.office?.blockedBody, `days.${day}.office.blockedBody`);

    for (const id of SUSPECT_IDS) {
      require(d.meeting?.quotes?.[id], `days.${day}.meeting.quotes.${id}`);
      require(d.investigations?.[id]?.observation, `days.${day}.investigations.${id}.observation`);
      require(d.investigations?.[id]?.question, `days.${day}.investigations.${id}.question`);
      require(d.investigations?.[id]?.answer, `days.${day}.investigations.${id}.answer`);
    }

    // Days 2 and 3 open by explaining the previous day's mistake.
    if (day === '1') {
      if (d.alert.reasons !== null) problems.push(`${label}: days.1.alert.reasons should be null`);
    } else {
      for (const id of SUSPECT_IDS) {
        if (id === 'mia') continue; // accusing Mia ends the run, so it never needs a reason
        require(d.alert?.reasons?.[id], `days.${day}.alert.reasons.${id}`);
      }
      if (!d.alert.body.includes('{name}')) {
        problems.push(`${label}: days.${day}.alert.body must contain {name}`);
      }
    }
  }

  for (const outcome of OUTCOMES) {
    require(story.endings[outcome]?.headline, `endings.${outcome}.headline`);
    require(story.endings[outcome]?.body, `endings.${outcome}.body`);
    require(story.endings[outcome]?.lesson, `endings.${outcome}.lesson`);
  }

  if (!story.ui.confirmBody.includes('{name}')) problems.push(`${label}: ui.confirmBody needs {name}`);
  if (!story.ui.chooseOption.includes('{name}')) problems.push(`${label}: ui.chooseOption needs {name}`);

  return problems;
}

/** Substitutes `{name}`-style placeholders. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}
