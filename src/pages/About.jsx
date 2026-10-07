import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import Page from '../components/Page';
import PageHeader from '../components/PageHeader';
import Motif from '../components/Motif';
import Experience from '../components/Experience';
import Locations from '../components/Locations';

const PHOTO = '/assets/about-reception.webp';
const PHOTO_SM = '/assets/about-reception-sm.webp';

function Photo() {
  return (
    <picture>
      <source media="(max-width: 700px)" srcSet={PHOTO_SM} />
      <img src={PHOTO} alt="" />
    </picture>
  );
}

/* The reception wall, fixed behind the whole page; it softens into a blur once you scroll past the first screen */
function Backdrop() {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.timeline({
      scrollTrigger: { start: 0, end: () => innerHeight, scrub: true, invalidateOnRefresh: true }
    })
      .to('.backdrop__layer--blur', { opacity: 1, ease: 'power1.inOut' }, 0)
      .to('.backdrop__shade', { opacity: 1, ease: 'power1.inOut' }, 0);
  }, { scope: ref });

  return (
    <div className="backdrop" ref={ref} aria-hidden="true">
      <div className="backdrop__layer"><Photo /></div>
      <div className="backdrop__layer backdrop__layer--blur"><Photo /></div>
      <div className="backdrop__shade" />
      <div className="backdrop__grad" />
    </div>
  );
}

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
    <>
      <Backdrop />
      <Page className="page--about">
        <PageHeader
          hero
          eyebrow="About Us"
          lines={[<>The House of <em>Sivabhagya.</em></>]}
          intro="Three addresses, one way of welcoming you — warm, attentive and unhurried."
        />
        <Story />
        <Motif />
        <Experience />
        <Locations />
      </Page>
    </>
  );
}
