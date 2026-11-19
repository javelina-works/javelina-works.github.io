/* Javelina Works components. React 18 is read from window.React; the result is window.JavelinaWorks. */
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
function SurveyMap({ src, alt = 'Survey image', plants: initial = [], height = 260, editable = true, showCounts = true, onChange, className, style }) {
  const [plants, setPlants] = useState(initial);
  const [selected, setSelected] = useState(null);
  const toggle = useCallback((id) => {
    setSelected(id);
    if (!editable) return;
    setPlants((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, status: p.status === 'treat' ? 'keep' : 'treat' } : p));
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
          <button key={p.id} type="button" className={cx('jw-marker', !isTreat && 'jw-marker--keep', selected === p.id && 'jw-marker--selected')}
            style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-label={label} aria-pressed={editable ? isTreat : undefined} onClick={() => toggle(p.id)}>
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
function Meter({ value, max, label, unit = 'ac', animate = true, className }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const [shown, setShown] = useState(animate && !prefersReducedMotion() ? 0 : pct);
  useEffect(() => {
    if (!animate || prefersReducedMotion()) { setShown(pct); return; }
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(pct)));
    return () => cancelAnimationFrame(id);
  }, [pct, animate]);
  const fmt = (n) => Number(n).toLocaleString('en-US');
  return (
    <div className={cx('jw-meter-block', className)}>
      <div className="jw-meter-block__line"><span>{label}</span><span>{fmt(value)} of {fmt(max)} {unit}</span></div>
      <div className="jw-meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <div className="jw-meter__fill" style={{ width: `${shown}%` }} />
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
/* A section wall that takes light: flaky rust, corrugated tin, or smooth rust. Put cards on it, never running text. */
function LampWall({ texture = 'flake', seed = 3, as = 'section', className, children, ...rest }) {
  const Tag = as;
  return (
    <Tag className={cx('jw-wall', `jw-wall--${texture}`, className)} data-jw-wall={texture} data-jw-seed={seed} {...rest}>
      <canvas className="jw-wall__canvas" aria-hidden="true" />
      {children}
    </Tag>
  );
}
function Rivet({ className, style }) {
  return <span className={cx('jw-rivet', className)} style={style} aria-hidden="true"><i /><i /><i /></span>;
}
/* A wall-mounted glowing tube that fills to a value when it comes into view; its light falls on the wall around it. */
function LightTube({ value, max, label, unit = 'ac', pilot = true, plate = true, className }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (prefersReducedMotion() || !el || typeof IntersectionObserver === 'undefined') { setOn(true); return undefined; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setOn(true); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const fmt = (n) => Number(n).toLocaleString('en-US');
  return (
    <div className={cx('jw-tube-block', className)}>
      <div className="jw-lit jw-tube" ref={ref} data-jw-shadow="" role="img" aria-label={`${label}: ${fmt(value)} of ${fmt(max)} ${unit}`}>
        <span className="jw-cast" aria-hidden="true" /><span className="jw-cast" aria-hidden="true" />
        <div className="jw-tube__track"><i className="jw-tube__fill" data-jw-light="tube" style={{ width: on ? `${pct}%` : '0%' }} /></div>
        <span className="jw-tube__clamp jw-tube__clamp--l" aria-hidden="true">{pilot ? <span className={cx('jw-pilot', on && 'is-on')} data-jw-light={on ? 'pilot' : undefined} /> : <Rivet />}</span>
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
function NavBar({ links = [], action, lamp = false, logos = LOGOS, homeHref = '/', className, children }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className={cx('jw-nav', open && 'is-open', className)} aria-label="Main">
      <a className="jw-nav__brand" href={homeHref}>
        <img className="jw-logo--light" src={logos.light.mark} alt="" style={{ height: 24, width: 'auto' }} />
        <img className="jw-logo--dark" src={logos.dark.mark} alt="" style={{ height: 24, width: 'auto' }} />
        <img className="jw-logo--light" src={logos.light.wordmark} alt="Javelina Works" style={{ height: 13, width: 'auto' }} />
        <img className="jw-logo--dark" src={logos.dark.wordmark} alt="Javelina Works" style={{ height: 13, width: 'auto' }} />
      </a>
      <button type="button" className="jw-nav__menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? 'Close' : 'Menu'}</button>
      <div className="jw-nav__links">
        {links.map((l) => (
          <a key={l.href} className="jw-nav__link" href={l.href} aria-current={l.current ? 'page' : undefined}>{l.label}</a>
        ))}
        {children}
        {action && <Button size={lamp ? 'md' : 'sm'} lamp={lamp} href={action.href}>{action.label}</Button>}
      </div>
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
function ThemeToggle({ value, onChange, target, labels = { light: 'By day', dark: 'By night' }, className }) {
  const root = () => target || (typeof document !== 'undefined' ? document.documentElement : null);
  const read = () => { const r = root(); return r && r.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; };
  const [inner, setInner] = useState(read);
  const theme = value || inner;
  const set = (t) => {
    if (!value) setInner(t);
    const r = root(); if (r) r.setAttribute('data-theme', t);
    if (onChange) onChange(t);
  };
  return (
    <div className={cx('jw-toggle', className)} role="radiogroup" aria-label="Color mode">
      {['light', 'dark'].map((t) => (
        <button key={t} type="button" role="radio" aria-checked={theme === t} className={cx('jw-toggle__opt', `jw-toggle__opt--${t}`, theme === t && 'is-on')} onClick={() => set(t)}>
          <span className="jw-toggle__lamp" aria-hidden="true" />{labels[t]}
        </button>
      ))}
    </div>
  );
}

window.JavelinaWorks = { Button, Chip, SurveyMap, Meter, Surface, NavBar, Field, ThemeToggle, LightScene, LampWall, LightTube, StatusLight, Rivet, Lighting, LOGOS };
