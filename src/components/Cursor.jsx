import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, useGSAP, reduceMotion, finePointer } from '../motion';

const HOVERABLE = 'a, button, select, input, textarea, .exp__row';

/* Gold dot + trailing ring, plus the gentle pull on [data-magnetic] buttons */
export default function Cursor() {
  const ref = useRef(null);
  const { pathname } = useLocation();

  useGSAP(() => {
    if (!finePointer || reduceMotion) return;
    const cursor = ref.current;
    const dx = gsap.quickTo('.cursor__dot', 'x', { duration: 0.12 });
    const dy = gsap.quickTo('.cursor__dot', 'y', { duration: 0.12 });
    const rx = gsap.quickTo('.cursor__ring', 'x', { duration: 0.55, ease: 'power3.out' });
    const ry = gsap.quickTo('.cursor__ring', 'y', { duration: 0.55, ease: 'power3.out' });

    const onMove = e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };
    const onOver = e => cursor.classList.toggle('is-hover', !!e.target.closest?.(HOVERABLE));
    addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);

    const magnets = gsap.utils.toArray('[data-magnetic]').map(el => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      const move = e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      };
      const leave = () => { mx(0); my(0); };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
    });

    return () => {
      removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      magnets.forEach(off => off());
    };
  }, { scope: ref, dependencies: [pathname], revertOnUpdate: true });

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <span className="cursor__dot" />
      <span className="cursor__ring" />
    </div>
  );
}
