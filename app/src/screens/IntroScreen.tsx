import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { INTRO_VIDEO } from '../assets';
import { Button } from '../components/ui';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * The opening cinematic. The decision tree starts on "the lead finds out about
 * the cyberattack", and the seven-second clip for it shipped with the course but
 * was never wired to a slide — it only ever sat in the asset table.
 *
 * It is skippable and, if the file will not play, gets out of the way by itself
 * rather than stranding anyone on a black screen.
 */
export function IntroScreen({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  // A clip that never loads must not become a dead end.
  useEffect(() => {
    const id = setTimeout(finish, 12_000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative grid min-h-dvh w-full place-items-center bg-ground"
    >
      <video
        src={INTRO_VIDEO}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onCanPlay={() => setReady(true)}
        onEnded={finish}
        onError={finish}
        className={`h-full max-h-dvh w-full object-contain transition-opacity duration-500 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <Button
        tone="ghost"
        sfx="click"
        onClick={finish}
        className="absolute right-5 bottom-5 sm:right-8 sm:bottom-8"
      >
        {t('skip')}
      </Button>
    </motion.section>
  );
}
