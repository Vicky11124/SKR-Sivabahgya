import { useState } from 'react';
import Intro from '../components/Intro';
import Stage from '../components/Stage';
import Page from '../components/Page';
import Motif from '../components/Motif';
import PlacesCarousel from '../components/PlacesCarousel';
import Statement from '../components/Statement';
import Nearby from '../components/Nearby';
import OurPromise from '../components/Promise';
import Invite from '../components/Invite';
import Reserve from '../components/Reserve';
import CursorGrid from '../components/CursorGrid';
import { finePointer, reduceMotion } from '../motion';

export default function Home({ introPending, onIntroDone }) {
  // Decided once per mount, so coming back to Home later doesn't replay the intro
  const [playIntro] = useState(() => introPending.current);

  return (
    <>
      {playIntro && <Intro onDone={onIntroDone} />}
      <Stage />
      {/* Gold cells that light up around the cursor — mouse and trackpad only, and not when motion is reduced */}
      {finePointer && !reduceMotion && (
        <CursorGrid
          global
          className="cursor-grid--home"
          cellSize={65}
          color="#C09D58"
          radius={130}
          falloff="smooth"
          holdTime={400}
          fadeDuration={1400}
          lineWidth={0.5}
          maxOpacity={0.3}
          fillOpacity={0}
          gridOpacity={0}
          cellRadius={0}
          clickPulse
          pulseSpeed={600}
        />
      )}
      <Page hero>
        <Statement />
        <Motif />
        <PlacesCarousel />
        <Nearby />
        <Invite />
        <OurPromise />
        <Reserve />
      </Page>
    </>
  );
}
