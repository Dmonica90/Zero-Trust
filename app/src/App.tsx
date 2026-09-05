import { AnimatePresence } from 'framer-motion';
import { useReducer } from 'react';
import { initialState, reducer } from './game/machine';
import { AlertScreen } from './screens/AlertScreen';
import { EndingScreen } from './screens/EndingScreen';
import { InvestigateScreen } from './screens/InvestigateScreen';
import { MeetingScreen } from './screens/MeetingScreen';
import { OfficeScreen } from './screens/OfficeScreen';
import { TitleScreen } from './screens/TitleScreen';

/**
 * The whole game is one reducer plus a switch over `phase`. Adding a screen
 * means adding a phase and a case, not rewiring navigation.
 */
export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const screen = () => {
    switch (state.phase) {
      case 'title':
        return <TitleScreen key="title" onStart={() => dispatch({ type: 'start' })} />;

      case 'alert':
        return (
          <AlertScreen
            key={`alert-${state.day}`}
            state={state}
            onContinue={() => dispatch({ type: 'gatherTeam' })}
          />
        );

      case 'meeting':
        return (
          <MeetingScreen
            key={`meeting-${state.day}`}
            state={state}
            onInvestigate={() => dispatch({ type: 'goToOffice' })}
            onAttemptAccuse={() => dispatch({ type: 'attemptAccuseFromMeeting' })}
            onDismissHint={() => dispatch({ type: 'dismissBlockedHint' })}
          />
        );

      case 'office':
        return (
          <OfficeScreen
            key={`office-${state.day}`}
            state={state}
            onOpenSuspect={(suspect) => dispatch({ type: 'openSuspect', suspect })}
            onPropose={(suspect) => dispatch({ type: 'proposeAccusation', suspect })}
            onCancel={() => dispatch({ type: 'cancelAccusation' })}
            onConfirm={() => dispatch({ type: 'confirmAccusation' })}
          />
        );

      case 'investigating':
        return state.investigating ? (
          <InvestigateScreen
            key={`investigate-${state.day}-${state.investigating}`}
            state={state}
            suspect={state.investigating}
            onQuestion={() => dispatch({ type: 'questionSuspect' })}
            onBack={() => dispatch({ type: 'closeSuspect' })}
          />
        ) : null;

      case 'ended':
        return (
          <EndingScreen key="ending" state={state} onRestart={() => dispatch({ type: 'restart' })} />
        );
    }
  };

  return <AnimatePresence mode="wait">{screen()}</AnimatePresence>;
}
