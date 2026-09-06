import { motion } from 'framer-motion';
import { useState } from 'react';
import { LOCALES, STORIES } from '../content';
import type { Locale } from '../content';
import { useLanguage } from '../i18n/LanguageProvider';
import { useSound } from '../audio/SoundProvider';
import { investigatedCount, remainingSuspects, threatLevel } from '../game/machine';
import type { GameState } from '../game/types';
import { Button, Dialog } from './ui';

/**
 * The persistent status bar. It carries the two things the Storyline course
 * could never show at a glance — how far the extraction has got, and what the
 * player has actually found so far.
 */
export function Hud({ state }: { state: GameState }) {
  const { t, locale, setLocale, story } = useLanguage();
  const { muted, toggleMuted } = useSound();
  const [logOpen, setLogOpen] = useState(false);

  const total = remainingSuspects(state).length;
  const done = investigatedCount(state);
  const threat = threatLevel(state.day);

  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
        {t('dayLabel', { day: String(state.day) })}
      </p>

      <div className="flex min-w-44 flex-1 items-center gap-3">
        <span className="sr-only">{t('threatLabel')}</span>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-2"
          role="progressbar"
          aria-label={t('threatLabel')}
          aria-valuenow={threat}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-warn to-alarm"
            initial={{ width: 0 }}
            animate={{ width: `${threat}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        <span className="font-mono text-xs text-alarm tabular-nums">{threat}%</span>
      </div>

      <p className="font-mono text-xs text-ink-dim tabular-nums">
        {t('investigatedLabel', { done: String(done), total: String(total) })}
      </p>

      <div className="flex items-center gap-1">
        <Button tone="quiet" sfx="click" onClick={() => setLogOpen(true)} className="px-3 text-sm">
          {t('evidenceTitle')}
          {state.evidence.length > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[0.7rem] text-ground">
              {state.evidence.length}
            </span>
          )}
        </Button>

        <Button
          tone="quiet"
          sfx={null}
          onClick={toggleMuted}
          aria-pressed={muted}
          className="px-3 text-sm"
        >
          {muted ? t('muteOn') : t('muteOff')}
        </Button>

        <label className="flex items-center gap-2 text-sm text-ink-dim">
          <span className="sr-only">{t('languageLabel')}</span>
          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
            className="min-h-11 rounded-xl border border-edge bg-panel-2 px-3 py-1 text-ink"
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {STORIES[code].languageName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Dialog open={logOpen} onClose={() => setLogOpen(false)} labelledBy="evidence-log-title">
        <h2 id="evidence-log-title" className="text-xl font-semibold">
          {t('evidenceTitle')}
        </h2>

        {state.evidence.length === 0 ? (
          <p className="mt-3 text-ink-dim">{t('evidenceEmpty')}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {state.evidence.map((entry) => (
              <li
                key={`${entry.day}-${entry.suspect}`}
                className="flex items-baseline gap-3 rounded-xl border border-edge bg-panel-2/60 px-4 py-3"
              >
                <span className="font-mono text-xs text-accent">
                  {t('dayShort', { day: String(entry.day) })}
                </span>
                <span className="font-medium">{story.characters[entry.suspect].name}</span>
                <span className="ml-auto font-mono text-xs text-ink-dim">
                  {entry.questioned ? t('evidenceQuestioned') : t('evidenceLooked')}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-end">
          <Button tone="ghost" sfx="click" onClick={() => setLogOpen(false)}>
            {t('close')}
          </Button>
        </div>
      </Dialog>
    </header>
  );
}
