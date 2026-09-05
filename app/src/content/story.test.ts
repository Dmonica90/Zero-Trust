import { describe, expect, it } from 'vitest';
import { detectLocale, LOCALES, STORIES } from './index';
import { fill, validateStory } from './schema';
import { SUSPECT_IDS } from '../game/types';

describe('story files', () => {
  for (const locale of LOCALES) {
    it(`${locale} is structurally complete`, () => {
      expect(validateStory(STORIES[locale], locale)).toEqual([]);
    });
  }

  it('every locale exposes the same keys', () => {
    const shape = (value: unknown, prefix = ''): string[] =>
      value !== null && typeof value === 'object'
        ? Object.entries(value as Record<string, unknown>)
            .flatMap(([k, v]) => shape(v, `${prefix}${k}.`))
            .sort()
        : [prefix];

    expect(shape(STORIES.es)).toEqual(shape(STORIES.en));
  });

  it('names the characters in both languages', () => {
    for (const locale of LOCALES) {
      for (const id of SUSPECT_IDS) {
        expect(STORIES[locale].characters[id].name.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('placeholders', () => {
  it('substitutes named values', () => {
    expect(fill('fire {name}?', { name: 'Leo' })).toBe('fire Leo?');
  });

  it('leaves unknown placeholders alone rather than printing undefined', () => {
    expect(fill('day {day}', {})).toBe('day {day}');
  });
});

describe('locale detection', () => {
  it('matches on the base language tag', () => {
    expect(detectLocale(['es-MX', 'en'])).toBe('es');
    expect(detectLocale(['en-GB'])).toBe('en');
  });

  it('falls back to Spanish for unsupported languages', () => {
    expect(detectLocale(['fr-FR', 'de'])).toBe('es');
    expect(detectLocale([])).toBe('es');
  });
});
