import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGES } from '../data/pages';
import SiteLink from './SiteLink';

export default function Nav({ menuOpen, setMenuOpen }) {
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      setSolid(y > innerHeight * (pathname === '/' ? 0.75 : 0.2));
      setHidden(y > lastY && y > innerHeight * 0.6);
      lastY = y;
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, [pathname]);

  // The booking form lives on Home and Places; elsewhere, Reserve takes you to Places
  const reserveTo = pathname === '/' || pathname === '/places' ? '#reserve' : '/places#reserve';
  const links = PAGES.map(({ path, label }) => (
    <SiteLink key={path} to={path} className={pathname === path ? 'is-active' : undefined} aria-current={pathname === path ? 'page' : undefined}>
      {label}
    </SiteLink>
  ));

  return (
    <>
      <header className={`nav${solid ? ' is-solid' : ''}${hidden && !menuOpen ? ' is-hidden' : ''}`}>
        <SiteLink to="/" className="nav__brand">
          <img src="/assets/logo-crest-sm.webp" alt="" className="nav__crest" />
          <span>SKR <i>·</i> Sivabhagya</span>
        </SiteLink>
        <nav className="nav__links" aria-label="Primary">
          {links}
          <SiteLink to={reserveTo} className="nav__cta" data-magnetic>Reserve</SiteLink>
        </nav>
        <button
          className="nav__toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span />
        </button>
      </header>

      <div className={`menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        {links}
        <SiteLink to={reserveTo} className="menu__cta">Reserve</SiteLink>
      </div>
    </>
  );
}
