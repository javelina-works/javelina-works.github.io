export type MarqueeConfig = {
  elementWidth: string;
  elementWidthAuto?: boolean;
  elementWidthInSmallDevices: string;
  pauseOnHover: boolean;
  reverse?: "reverse" | "" | undefined; // Optional: "reverse" or empty string
  duration: string;
};

// Type for this section data
export type customersSectionType = Section & {
  list: MarqueeListItem[];
  marquee: MarqueeConfig;
};

// Type for the video configuration
export type VideoConfig = {
  src: string; // youtube or vimeo video ID or path to video file
  type?: string; // Optional: only required for local files (e.g., "video/mp4")
  provider?: "youtube" | "vimeo" | "html5"; // Accepted providers (default is "youtube")
  poster?: string; // Optional: URL or image path for video thumbnail
  autoplay?: boolean; // Optional: true to autoplay, false to start manually (default is false)
  id?: string; // required if same video is used on multiple time on same page
};

export type TocHeading = {
  depth: number;
  slug: string;
  text: string;
  subheadings?: TocHeading[];
};

// Universal Type For Every Section
export type Section = {
  enable?: boolean;
  title?: string;
  excerpt?: string;
  date?: Date | string;
  author?: string;
  subtitle?: string;
  categories?: string[];
  description?: string;
  button?: Button;
  image?: string;
  limit?: false | number;
};

export type SocialLink = {
  enable: boolean;
  label: string;
  icon: string;
  url: string;
};

export type Social = {
  enable: boolean;
  list: SocialLink[];
};

export type FAQItem = {
  active: boolean;
  title: string;
  content: string;
};

export type FAQCategory = {
  label: string;
  list: FAQItem[];
};

export type NoteType = "info" | "warning" | "success" | "deprecated" | "hint";

export type DropdownType = "select" | "search";

export interface DropdownSearchConfig {
  placeholder?: string;
}

export interface DropdownItem {
  label: string;
  selected: true;
  value: string;
}

export interface DropdownConfig {
  type?: DropdownType;
  search?: DropdownSearchConfig;
  items: DropdownItem[];
}

export interface InputField {
  label: string;
  placeholder?: string;
  required: boolean;
  halfWidth: boolean;
  defaultValue: string;
  name?: string;
  selected?: boolean; // Only applicable if tag is input radio & checkbox
  value?: boolean; // Only applicable if tag is input radio & checkbox
  checked?: boolean; // Only applicable if tag is input radio & checkbox
  type?: "text" | "email" | "radio" | "checkbox";
  id?: string;
  parentClass?: string;
  tag?: "textarea";
  rows?: string; // Only applicable if tag is textarea
  group?: string; // Only applicable if tag is input radio & checkbox
  groupLabel?: string; // Only applicable if tag is input radio & checkbox
  items?: InputField[]; // Only applicable if tag is input radio & checkbox
  dropdown?: DropdownConfig;
  note?: NoteType;
  content?: string;
}

export interface ContactFormConfig {
  action: string;
  emailSubject: string;
  submitButton: SubmitButtonConfig;
  note: string;
  inputs: InputField[];
}

export interface Badge {
  enable: boolean;
  label: string;
  color: "primary" | "success" | "danger" | "warning" | string;
  type: "dot" | "text";
}

export interface Testimonial {
  enable: boolean;
  image: string;
  content: string;
}

export interface Service {
  enable: boolean;
  name: string;
}

export interface NavigationLinkCTA {
  enable: string;
  image: string;
  title: string;
  description: string;
  button: Button;
}

export interface ChildNavigationLink {
  enable: boolean;
  name: string;
  description: string;
  icon: string;
  weight?: number;
  url?: string;
  rel?: string;
  target?: string;
  hasChildren?: boolean;
  badge?: Badge;
  children?: ChildNavigationLink[];
}

export interface NavigationLink extends ChildNavigationLink {
  enable: boolean;
  weight?: number;
  hasMegaMenu?: boolean;
  cta?: NavigationLinkCTA;
  testimonial?: Testimonial;
  services?: Service;
  menus?: NavigationLink[];
}

// END MENU TYPE
// ----------------------------------------------------------------------
