import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import Page from '../components/Page';
import PageHeader from '../components/PageHeader';
import Motif from '../components/Motif';
import Experience from '../components/Experience';
import Locations from '../components/Locations';

function Story() {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.from('.story__quote, .story__body p', {
      opacity: 0, y: 40, duration: 1.4, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%' }
    });
  }, { scope: ref });

  return (
    <section className="story" ref={ref}>
      <blockquote className="story__quote">
        A guest should feel <em>expected</em> — never merely accommodated.
      </blockquote>
      <div className="story__body">
        <p>
          SKR Sivabhagya is a family of three stays in Tamil Nadu: an adventure resort in the hills of Kodaikanal,
          a business class hotel in the heart of Madurai, and private service apartments in Kochadai.
        </p>
        <p>
          Each has its own character — mountain air, temple-city bustle, the quiet of a home — but all three share one
          standard: rooms kept immaculate, food served with care, and a team that looks after the small things so you
          don't have to.
        </p>
        <p>
          The crest you see on our walls is a promise in gold. We would like every stay to live up to it.
        </p>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <Page>
      <PageHeader
        eyebrow="About Us"
        lines={['The House of', <em>Sivabhagya.</em>]}
        intro="Three addresses, one way of welcoming you — warm, attentive and unhurried."
      />
      <Story />
      <Motif />
      <Experience />
      <Locations hrefBase="/places" />
    </Page>
  );
}
