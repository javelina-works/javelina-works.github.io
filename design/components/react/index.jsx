/* Javelina Works components. React 18 is read from window.React; the result is window.JavelinaWorks.
   After a change, rebuild bundle.js from the repo root (esbuild, which Vite already installs):
     npx esbuild design/components/react/index.jsx --bundle --format=iife --target=es2019 --jsx=transform
   then drop the leading "use strict"; line and keep the one-line @ds-bundle header at the top. */
import Lighting from '../lighting.js';
const { useState, useEffect, useRef, useCallback } = React;
const cx = (...a) => a.filter(Boolean).join(' ');
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Default logo files: the uploads in this design system. Pass your own URLs on your site. */
const LOGOS = {
  light: { mark: '/assets/logos/javelina-rust.svg', wordmark: '/assets/logos/wordmark-ink.svg' },
  dark: { mark: '/assets/logos/javelina-white.svg', wordmark: '/assets/logos/wordmark-white.svg' },
};

/* ---------------------------------------------------------------- Button */
/* Plays the flicker-on once, when the element first comes into view. Never on a click, hover or theme switch. */
function useFlicker(enabled, onView) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!enabled || !onView || prefersReducedMotion()) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setActive(true); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setActive(true); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, onView]);
  return [ref, active, () => setActive(false)];
}
function Button({ variant = 'primary', size = 'md', href, mark, attention = 'none', lamp = false, disabled = false, className, onAnimationEnd, children, ...rest }) {
  const showMark = mark ?? (variant === 'primary' || variant === 'burnt');
  const primary = variant === 'primary' && !disabled;
  const [ref, flickering, flickerDone] = useFlicker(primary && !lamp, attention === 'flicker');
  if (lamp && primary) { rest['data-jw-light'] = 'lamp'; rest['data-jw-flicker'] = ''; }
  const cls = cx('jw-btn', `jw-btn--${variant}`, size === 'sm' && 'jw-btn--sm', flickering && 'is-flickering', className);
  const endAnim = (e) => { if (e.animationName && e.animationName.indexOf('jw-flicker') === 0) flickerDone(); if (onAnimationEnd) onAnimationEnd(e); };
  const inner = <>{attention === 'glint' && <span className="jw-btn__glint" aria-hidden="true" />}{showMark && <span className="jw-btn__mark" aria-hidden="true" />}{children}</>;
  const el = href
    ? <a ref={ref} className={cls} href={disabled ? undefined : href} aria-disabled={disabled || undefined} onAnimationEnd={endAnim} {...rest}>{inner}</a>
    : <button ref={ref} type="button" className={cls} disabled={disabled} onAnimationEnd={endAnim} {...rest}>{inner}</button>;
  if (attention === 'breathe') return <span className="jw-attn">{el}</span>;
  return el;
}

/* ---------------------------------------------------------------- Chip */
const DOT_TONES = { treat: true, success: true, warning: true, error: true };
function Chip({ tone = 'keep', dot, count, className, children, ...rest }) {
  const showDot = dot ?? !!DOT_TONES[tone];
  return (
    <span className={cx('jw-chip', `jw-chip--${tone}`, className)} {...rest}>
      {showDot && <span className="jw-chip__dot" aria-hidden="true" />}
      {children}{count != null && <> · {count}</>}
    </span>
  );
}

/* ---------------------------------------------------------------- SurveyMap */
/* A tap where two markers' 44px tap areas overlap goes to the nearest ring (the rings themselves always take their own
   taps: jw.css layers every tap area under every ring). A key press (detail 0) keeps its marker. */
function nearestMarker(e) {
  const own = e.currentTarget;
  if (!e.detail) return own;
  let best = own, bestD = 23;
  own.parentElement.querySelectorAll('.jw-marker[data-plant]').forEach((m) => {
    const r = m.getBoundingClientRect();
    const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    if (d < bestD) { bestD = d; best = m; }
  });
  if (best !== own && document.activeElement === own) best.focus({ preventScroll: true });
  return best;
}
function SurveyMap({ src, alt = 'Survey image', plants: initial = [], height = 260, editable = true, showCounts = true, onChange, className, style }) {
  const [plants, setPlants] = useState(initial);
  const [selected, setSelected] = useState(null);
  const toggle = useCallback((id) => {
    setSelected(String(id));
    if (!editable) return;
    setPlants((prev) => {
      const next = prev.map((p) => (String(p.id) === String(id) ? { ...p, status: p.status === 'treat' ? 'keep' : 'treat' } : p));
      if (onChange) onChange(next);
      return next;
    });
  }, [editable, onChange]);
  const treat = plants.filter((p) => p.status === 'treat').length;
  const keep = plants.length - treat;
  return (
    <div className={cx('jw-photo', 'jw-map', className)} style={{ height, ...style }}>
      <img src={src} alt={alt} />
      {plants.map((p) => {
        const isTreat = p.status === 'treat';
        const label = `Plant ${p.id}: ${isTreat ? 'treat' : 'keep'}.${editable ? ` Press to ${isTreat ? 'keep' : 'treat'} it.` : ''}`;
        return (
          <button key={p.id} type="button" className={cx('jw-marker', !isTreat && 'jw-marker--keep', selected === String(p.id) && 'jw-marker--selected')}
            style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-label={label} aria-pressed={editable ? isTreat : undefined} data-plant={p.id}
            onClick={(e) => toggle(nearestMarker(e).getAttribute('data-plant'))}>
            <span className="jw-marker__tip" aria-hidden="true">Plant {p.id} · {isTreat ? 'Treat' : 'Keep'}</span>
          </button>
        );
      })}
      {showCounts && (
        <span className="jw-map__counts" aria-live="polite">
          <Chip tone="treat" count={treat}>Treat</Chip>
          <Chip tone="shell" count={keep}>Keep</Chip>
        </span>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Meter */
/* The fill's width is set once; with animate (default) the lighting engine holds a meter that is below the fold at load empty
   (is-pending) and fills it by transform on first view. Without the engine, or with reduced motion, it simply shows full. */
function Meter({ value, max, label, unit = 'ac', animate = true, className }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const fmt = (n) => Number(n).toLocaleString('en-US');
  return (
    <div className={cx('jw-meter-block', className)} data-jw-reveal={animate ? '' : undefined}>
      <div className="jw-meter-block__line"><span>{label}</span><span>{fmt(value)} of {fmt(max)} {unit}</span></div>
      <div className="jw-meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <div className="jw-meter__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Surface */
function Surface({ variant = 'card', href, as, castShadow = false, rivets = false, className, children, ...rest }) {
  const band = variant === 'band-shell' || variant === 'band-agave';
  const Tag = href && !band ? 'a' : (as || (band ? 'section' : 'div'));
  const el = (
    <Tag className={cx('jw-surface', `jw-surface--${variant}`, href && !band && 'jw-surface--link', className)} href={band ? undefined : href} {...rest}>
      {children}{rivets && !band && ['tl', 'tr', 'bl', 'br'].map((k) => <Rivet key={k} className={`jw-rivet--${k}`} />)}
    </Tag>
  );
  if (castShadow && !band) return <div className="jw-lit" data-jw-shadow=""><span className="jw-cast" aria-hidden="true" /><span className="jw-cast" aria-hidden="true" />{el}</div>;
  return el;
}

/* ---------------------------------------------------------------- Lighting */
/* Starts the lighting engine for the page (once, however many scenes are mounted). */
function LightScene({ children }) {
  useEffect(() => { Lighting.mount(); return () => Lighting.unmount(); }, []);
  return children === undefined ? null : children;
}
/* A section wall that takes light: flaky rust, corrugated tin, or smooth rust. Put cards on it, never running text.
   It renders with jw-wall--static (the static drawing) and the engine removes that after the wall's first WebGL frame. */
function LampWall({ texture = 'flake', seed = 3, as = 'section', className, children, ...rest }) {
  const Tag = as;
  return (
    <Tag className={cx('jw-wall', `jw-wall--${texture}`, 'jw-wall--static', className)} data-jw-wall={texture} data-jw-seed={seed} {...rest}>
      <canvas className="jw-wall__canvas" aria-hidden="true" />
      {children}
    </Tag>
  );
}
function Rivet({ className, style }) {
  return <span className={cx('jw-rivet', className)} style={style} aria-hidden="true"><i /><i /><i /></span>;
}
/* A wall-mounted glowing tube that fills to a value when it comes into view; its light falls on the wall around it.
   The lighting engine does the filling (data-jw-reveal): below the fold at load it waits empty with the pilot off, and fills by
   transform on first view. Already in view, without the engine, or with reduced motion: full, pilot on. */
function LightTube({ value, max, label, unit = 'ac', pilot = true, plate = true, animate = true, className }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const fmt = (n) => Number(n).toLocaleString('en-US');
  return (
    <div className={cx('jw-tube-block', className)} data-jw-reveal={animate ? '' : undefined}>
      <div className="jw-lit jw-tube" data-jw-shadow="" role="img" aria-label={`${label}: ${fmt(value)} of ${fmt(max)} ${unit}`}>
        <span className="jw-cast" aria-hidden="true" /><span className="jw-cast" aria-hidden="true" />
        <div className="jw-tube__track"><i className="jw-tube__fill" data-jw-light="tube" style={{ width: `${pct}%` }} /></div>
        <span className="jw-tube__clamp jw-tube__clamp--l" aria-hidden="true">{pilot ? <span className="jw-pilot is-on" data-jw-light="pilot" /> : <Rivet />}</span>
        <span className="jw-tube__clamp jw-tube__clamp--r" aria-hidden="true"><Rivet /></span>
      </div>
      {plate && (
        <Surface variant="card" castShadow rivets className="jw-plate" aria-hidden="true">
          <span className="jw-plate__label">{label}</span>
          <span className="jw-plate__value">{fmt(value)} <small>of {fmt(max)} {unit}</small></span>
        </Surface>
      )}
    </div>
  );
}
/* A small green light that means things are running fine. Blinks slowly unless blink is false. */
function StatusLight({ label, blink = true, className }) {
  const attrs = { 'data-jw-light': 'status' }; if (blink) attrs['data-jw-blink'] = '';
  return (
    <span className={cx('jw-status', className)}>
      <span className="jw-pilot jw-pilot--status" aria-hidden="true" {...attrs} />
      <span className="jw-status__label">{label}</span>
    </span>
  );
}

/* ---------------------------------------------------------------- NavBar */
/* links: [{ label, href, current }] or a menu [{ label, items: [{ label, href, description, current }], all: { label, href }, current, align: 'end' }].
   moreLinks show only in the phone menu. The action sits outside the links, so the lamp stays in view on phones.
   Folded (900px and below) the links render after the action, so Tab goes Menu, lamp, then the open panel, as drawn. */
let navSeq = 0;
const FOLDED = '(max-width: 900px)';
const isFolded = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(FOLDED).matches;
function NavBar({ links = [], moreLinks = [], action, lamp = false, sticky = false, logos = LOGOS, homeHref = '/', id, className, children }) {
  const base = useRef(id || `jw-nav-${++navSeq}`).current;
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [folded, setFolded] = useState(isFolded);
  const navRef = useRef(null), menuRef = useRef(null);
  useEffect(() => {
    const away = (e) => { if (navRef.current && !navRef.current.contains(e.target)) { setMenu(null); setOpen(false); } };
    document.addEventListener('click', away);
    return () => document.removeEventListener('click', away);
  }, []);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(FOLDED);
    const change = () => { setFolded(mq.matches); setOpen(false); setMenu(null); };
    mq.addEventListener('change', change);
    return () => mq.removeEventListener('change', change);
  }, []);
  /* Escape on the document while a menu or the panel is open: a menu opened with the mouse leaves focus outside the nav in
     Safari. Focus goes back to the trigger or Menu only if it was in the nav or nowhere. */
  useEffect(() => {
    if (menu === null && !open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const at = document.activeElement;
      const refocus = !at || at === document.body || (navRef.current && navRef.current.contains(at));
      if (menu !== null) { const t = navRef.current && navRef.current.querySelector(`[aria-controls="${base}-menu-${menu}"]`); setMenu(null); if (t && refocus) t.focus(); }
      else { setOpen(false); if (menuRef.current && refocus) menuRef.current.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu, open, base]);
  const onBlur = (e) => {
    const g = e.target.closest && e.target.closest('.jw-nav__group');
    if (g && !g.contains(e.relatedTarget) && !isFolded()) setMenu(null);
  };
  const mark = (t) => ({ className: cx(`jw-logo--${t}`), src: logos[t].mark, alt: '', width: 32, height: 24, style: { height: 24, width: 'auto' } });
  const word = (t) => ({ className: cx(`jw-logo--${t}`, 'jw-nav__wordmark'), src: logos[t].wordmark, alt: 'Javelina Works', width: 152, height: 13, style: { height: 13, width: 'auto' } });
  const actionEl = action ? <Button key="action" className="jw-nav__action" size={lamp ? 'md' : 'sm'} lamp={lamp} href={action.href}>{action.label}</Button> : null;
  return (
    <nav ref={navRef} className={cx('jw-nav', sticky && 'jw-nav--sticky', open && 'is-open', className)} aria-label="Main" onBlur={onBlur}>
      <a className="jw-nav__brand" href={homeHref}>
        <img {...mark('light')} /><img {...mark('dark')} /><img {...word('light')} /><img {...word('dark')} />
      </a>
      <button ref={menuRef} type="button" className="jw-nav__menu" aria-expanded={open} aria-controls={`${base}-links`} onClick={() => setOpen((o) => !o)}>{open ? 'Close' : 'Menu'}</button>
      {folded && actionEl}
      <div className="jw-nav__links" id={`${base}-links`} key="links">
        {links.map((l, i) => (l.items ? (
          <div className="jw-nav__group" key={l.label}>
            <button type="button" className={cx('jw-nav__link', 'jw-nav__trigger', l.current && 'is-current')} aria-expanded={menu === i} aria-controls={`${base}-menu-${i}`}
              onClick={() => setMenu((m) => (m === i ? null : i))}>{l.label}<span className="jw-nav__caret" aria-hidden="true" /></button>
            <div className={cx('jw-navmenu', l.align === 'end' && 'jw-navmenu--end')} id={`${base}-menu-${i}`} hidden={menu !== i}>
              <ul className="jw-navmenu__list">
                {l.items.map((it) => (
                  <li key={it.href}><a className="jw-navmenu__item" href={it.href} aria-current={it.current ? 'page' : undefined}>
                    <span className="jw-navmenu__label">{it.label}</span>{it.description && <span className="jw-navmenu__desc">{it.description}</span>}
                  </a></li>
                ))}
              </ul>
              {l.all && <a className="jw-navmenu__all" href={l.all.href} aria-current={l.all.current ? 'page' : undefined}>{l.all.label}</a>}
            </div>
          </div>
        ) : (
          <a key={l.href} className="jw-nav__link" href={l.href} aria-current={l.current ? 'page' : undefined}>{l.label}</a>
        )))}
        {moreLinks.length > 0 && (
          <div className="jw-nav__more">
            {moreLinks.map((l) => <a key={l.href} className="jw-nav__link" href={l.href} aria-current={l.current ? 'page' : undefined}>{l.label}</a>)}
          </div>
        )}
        {children}
      </div>
      {!folded && actionEl}
    </nav>
  );
}

/* ---------------------------------------------------------------- Field */
let fieldSeq = 0;
function Field({ id, label, hint, error, suffix, value, defaultValue, onChange, validate, inputMode, placeholder, type = 'text', className }) {
  const autoId = useRef(id || `jw-field-${++fieldSeq}`).current;
  const [inner, setInner] = useState(defaultValue ?? '');
  const [msg, setMsg] = useState(null);
  const v = value !== undefined ? value : inner;
  const shown = error || msg;
  const describedBy = [hint && `${autoId}-hint`, shown && `${autoId}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('jw-field', shown && 'jw-field--error', className)}>
      <label className="jw-field__label" htmlFor={autoId}>{label}</label>
      <div className="jw-input-wrap">
        <input id={autoId} className={cx('jw-input', suffix && 'jw-input--suffixed')} type={type} inputMode={inputMode} placeholder={placeholder} value={v}
          aria-invalid={shown ? true : undefined} aria-describedby={describedBy}
          onChange={(e) => { if (value === undefined) setInner(e.target.value); if (msg) setMsg(null); if (onChange) onChange(e.target.value, e); }}
          onBlur={() => { if (validate) setMsg(validate(v) || null); }} />
        {suffix && <span className="jw-input__suffix" aria-hidden="true">{suffix}</span>}
      </div>
      {hint && !shown && <span className="jw-field__hint" id={`${autoId}-hint`}>{hint}</span>}
      {shown && <span className="jw-field__error" id={`${autoId}-err`}>{shown}</span>}
    </div>
  );
}

/* ---------------------------------------------------------------- ThemeToggle */
/* A radio group: arrow keys move the choice, only the chosen option is a tab stop. It sets data-theme on <html> (the lighting
   engine reads it there), saves the choice in localStorage under storageKey (the page's head script reads it before first
   paint), and follows data-theme if something else changes it. */
const THEME_KEY = 'jw-theme';
function ThemeToggle({ value, onChange, target, labels = { light: 'By day', dark: 'At night' }, storageKey = THEME_KEY, className }) {
  const root = () => target || (typeof document !== 'undefined' ? document.documentElement : null);
  const read = () => { const r = root(); return r && r.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; };
  const [inner, setInner] = useState(read);
  const theme = value || inner;
  const lightRef = useRef(null), darkRef = useRef(null);
  useEffect(() => {
    const r = root();
    if (!r || typeof MutationObserver === 'undefined') return undefined;
    const mo = new MutationObserver(() => setInner(read()));
    mo.observe(r, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, [target]);
  const set = (t, focus) => {
    if (!value) setInner(t);
    const r = root(); if (r) r.setAttribute('data-theme', t);
    if (storageKey) { try { localStorage.setItem(storageKey, t); } catch (e) { /* private mode: the choice lasts this page */ } }
    if (focus) { const b = t === 'dark' ? darkRef.current : lightRef.current; if (b) b.focus(); }
    if (onChange) onChange(t);
  };
  const onKeyDown = (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) < 0) return;
    e.preventDefault(); set(theme === 'dark' ? 'light' : 'dark', true);
  };
  return (
    <div className={cx('jw-toggle', className)} role="radiogroup" aria-label="Color mode" onKeyDown={onKeyDown}>
      {['light', 'dark'].map((t) => (
        <button key={t} ref={t === 'dark' ? darkRef : lightRef} type="button" role="radio" aria-checked={theme === t} tabIndex={theme === t ? 0 : -1}
          className={cx('jw-toggle__opt', `jw-toggle__opt--${t}`, theme === t && 'is-on')} onClick={() => set(t)}>
          <span className="jw-toggle__lamp" aria-hidden="true" />{labels[t]}
        </button>
      ))}
    </div>
  );
}

window.JavelinaWorks = { Button, Chip, SurveyMap, Meter, Surface, NavBar, Field, ThemeToggle, LightScene, LampWall, LightTube, StatusLight, Rivet, Lighting, LOGOS };
