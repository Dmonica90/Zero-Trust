import { motion } from 'framer-motion';
import { useState } from 'react';
import { BACKDROPS, MARCUS } from '../assets';
import { Hud } from '../components/Hud';
import { SuspectCard } from '../components/SuspectCard';
import { Button, Dialog, Scene } from '../components/ui';
import { remainingSuspects } from '../game/machine';
import type { GameState, SuspectId } from '../game/types';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * The stand-up: every remaining team member gives their account. Reading a quote
 * costs nothing, which is the point — talk is cheap, evidence is at the desks.
 */
export function MeetingScreen({
  state,
  onInvestigate,
  onAttemptAccuse,
  onDismissHint,
}: {
  state: GameState;
  onInvestigate: () => void;
  onAttemptAccuse: () => void;
  onDismissHint: () => void;
}) {
  const { story, t } = useLanguage();
  const day = story.days[String(state.day) as '1' | '2' | '3'];
  const [intro, setIntro] = useState(true);
  const [heard, setHeard] = useState<Set<SuspectId>>(new Set());
  const suspects = remainingSuspects(state);

  return (
    <Scene backdrop={BACKDROPS.meeting} overlay="bg-ground/80">
      <Hud state={state} />

      <div className="flex flex-1 flex-col justify-center gap-8 py-8">
        <p className="text-center text-sm text-ink-dim sm:text-base">{day.meeting.hint}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {suspects.map((id, index) => (
            <SuspectCard
              key={id}
              suspect={id}
              index={index}
              investigated={heard.has(id)}
              quote={heard.has(id) ? day.meeting.quotes[id] : undefined}
              onSelect={() => setHeard((current) => new Set(current).add(id))}
            />
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onInvestigate} sfx="open">
            {t('investigate')}
          </Button>
          <Button tone="ghost" onClick={onAttemptAccuse} sfx="click">
            {t('accuse')}
          </Button>
        </div>
      </div>

      <Dialog open={intro} onClose={() => setIntro(false)} labelledBy="meeting-intro-title">
        <div className="flex gap-4">
          <img
            src={MARCUS.explaining}
            alt=""
            aria-hidden="true"
            className="hidden h-36 w-auto object-contain sm:block"
          />
          <div>
            <h2 id="meeting-intro-title" className="text-xl font-semibold">
              {day.meeting.introTitle}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-dim">{day.meeting.introBody}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setIntro(false)} sfx="select">
            {t('close')}
          </Button>
        </div>
      </Dialog>

      <Dialog open={state.showBlockedHint} onClose={onDismissHint} labelledBy="blocked-hint-title">
        <motion.h2
          id="blocked-hint-title"
          initial={{ x: -8 }}
          animate={{ x: [0, -8, 8, -4, 0] }}
          transition={{ duration: 0.45 }}
          className="text-xl font-semibold text-warn"
        >
          {day.office.blockedTitle}
        </motion.h2>
        <p className="mt-3 leading-relaxed text-ink-dim">{day.office.blockedBody}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button tone="ghost" onClick={onDismissHint} sfx="click">
            {t('close')}
          </Button>
          <Button onClick={onInvestigate} sfx="open">
            {t('investigate')}
          </Button>
        </div>
      </Dialog>
    </Scene>
  );
}
