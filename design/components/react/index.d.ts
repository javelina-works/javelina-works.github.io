/* Javelina Works components: window.JavelinaWorks. React 18 on the page; load tokens.css and bundle.css. */
import type { ReactNode, CSSProperties } from 'react';

export interface ButtonProps {
  /** primary: tip orange that lights up on hover by day and glows at night. */
  variant?: 'primary' | 'burnt' | 'tint' | 'ghost' | 'shell' | 'agave' | 'quiet';
  size?: 'md' | 'sm';
  /** Renders an <a> when set; otherwise a <button type="button">. */
  href?: string;
  /** The small square before the label. Defaults on for primary and burnt. */
  mark?: boolean;
  /** flicker: the light stutters on when the button comes into view. breathe shows at night only. */
  attention?: 'none' | 'flicker' | 'glint' | 'breathe';
  /** Primary only: the button becomes the page's lamp. It flickers on the first time it comes into view and lights the walls,
   *  pools, shadows and rivets around it. Needs a LightScene (or Lighting.mount()) on the page. */
  lamp?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  [prop: string]: unknown;
}
export interface ChipProps {
  tone?: 'treat' | 'keep' | 'shell' | 'selected' | 'queued' | 'success' | 'warning' | 'error';
  /** Appended as " · n". */
  count?: number;
  dot?: boolean;
  children?: ReactNode;
}
export interface Plant { id: string | number; x: number; y: number; status: 'treat' | 'keep'; }
export interface SurveyMapProps {
  src: string;
  alt?: string;
  /** The starting set; x and y are percentages of the photo. */
  plants?: Plant[];
  height?: number;
  editable?: boolean;
  showCounts?: boolean;
  onChange?: (plants: Plant[]) => void;
  className?: string;
  style?: CSSProperties;
}
export interface MeterProps { label: string; value: number; max: number; unit?: string; animate?: boolean; className?: string; }
export interface SurfaceProps {
  /** Bands hold cards and components, never running text. */
  variant?: 'card' | 'tint' | 'band-shell' | 'band-agave';
  href?: string;
  /** Cards: the shadow moves with the lights (away from the lamp at night, down and right by day). Needs a LightScene. */
  castShadow?: boolean;
  /** A brass rivet in each corner. One or two cards a page. */
  rivets?: boolean;
  as?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
export interface NavLink { label: string; href: string; current?: boolean; }
export interface NavBarProps {
  links?: NavLink[];
  action?: { label: string; href: string };
  /** The action becomes a full-size lamp Button that lights the page as it scrolls under the bar. */
  lamp?: boolean;
  homeHref?: string;
  logos?: { light: { mark: string; wordmark: string }; dark: { mark: string; wordmark: string } };
  children?: ReactNode;
}
export interface FieldProps {
  label: string;
  id?: string;
  hint?: string;
  error?: string;
  /** Return an error message, or nothing when the value is fine. Runs on blur. */
  validate?: (value: string) => string | null | undefined;
  suffix?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: unknown) => void;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email';
  placeholder?: string;
  type?: string;
}
export interface ThemeToggleProps {
  value?: 'light' | 'dark';
  onChange?: (theme: 'light' | 'dark') => void;
  /** Element that gets data-theme; defaults to <html>. */
  target?: Element;
  labels?: { light: string; dark: string };
}

/* ---- lighting ---- */
/** Starts the lighting engine for everything inside it (walls, lights, pools, shadows, rivets). Use once per page. */
export interface LightSceneProps { children?: ReactNode; }
export interface LampWallProps {
  /** flake: heavy flaky rust (the hero). corrugated: vertical tin. smooth: fine raking rust (quiet sections, footer). */
  texture?: 'flake' | 'corrugated' | 'smooth';
  /** Changes the pattern so two walls of one texture don't match. */
  seed?: number;
  as?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
export interface LightTubeProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  /** The green pilot on the left clamp, lit once the tube fills. Default true. */
  pilot?: boolean;
  /** The riveted plate under the tube with the label and number. Default true. */
  plate?: boolean;
  className?: string;
}
export interface StatusLightProps { label: string; /** Slow blink; default true. Off for reduced motion. */ blink?: boolean; className?: string; }
export interface RivetProps { className?: string; style?: CSSProperties; }
/** The framework-free engine behind LightScene. Finds pieces by data-jw-* attributes and keeps watching for new ones. */
export interface LightingApi {
  mount(root?: Element | Document): LightingApi;
  unmount(): void;
  /** Re-read the page after adding or removing pieces outside React. */
  refresh(): void;
}
