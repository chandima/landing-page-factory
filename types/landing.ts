/**
 * Content schema for landing.json.
 *
 * All page content lives in content/landing.json and is typed here.
 * Section wrappers receive their slice via `:model` prop binding.
 */

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface CtaLink {
  label: string;
  href: string;
  target?: string;
}

export interface NavItem {
  text: string;
  href: string;
  target?: string;
  children?: Array<{ text: string; href: string; target?: string }>;
}

// ---------------------------------------------------------------------------
// Top-level content blocks
// ---------------------------------------------------------------------------

export interface MetaContent {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface HeaderContent {
  homeTitle?: string;
  logoLinkUrl?: string;
  isSticky?: boolean;
  navItems?: NavItem[];
  displayApplyNow?: boolean;
  applyNowText?: string;
  applyNowRedirectUrl?: string;
  displayRfiCta?: boolean;
  rfiCtaText?: string;
  rfiAnchorId?: string;
}

export interface HeroContent {
  headline: string;
  subheadline?: string;
  backgroundImage?: string;
  bgImageSource?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  variant?: string;
  id?: string;
}

export interface FooterContent {
  secondaryLinks: Array<{ text: string; href: string }>;
}

// ---------------------------------------------------------------------------
// Section types (used in sections[] array)
// ---------------------------------------------------------------------------

interface SectionBase {
  title?: string;
  id?: string;
  variant?: string;
  /** When true, section renders full-width (breaks out of container). */
  fullWidth?: boolean;
}

export interface ValueSection extends SectionBase {
  type: "value";
  body: string;
  imageSource?: string;
  image?: string;
  imagePosition?: "left" | "right";
  cta?: CtaLink;
}

export interface FAQSection extends SectionBase {
  type: "faq";
  items: Array<{ title: string; content: string; image?: string }>;
  image?: string;
}

export interface TestimonialSection extends SectionBase {
  type: "testimonial";
  items: Array<{
    quote: string;
    name: string;
    role?: string;
    image?: string;
  }>;
  cta?: CtaLink;
}

export interface CardGridSection extends SectionBase {
  type: "cardGrid";
  gridColumns?: number;
  items: Array<{
    iconSource: string;
    iconAlt?: string;
    title: string;
    body?: string;
    cta?: CtaLink;
  }>;
}

export interface VideoSection extends SectionBase {
  type: "video";
  text?: string;
  bgVideoSource: string;
  mobileImageSource: string;
  mobileImageAltText?: string;
  videoAlt?: string;
  cta?: CtaLink;
}

export interface FormSection extends SectionBase {
  type: "form";
  subtitle?: string;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    options?: Array<{ label: string; value: string }>;
  }>;
  submitLabel?: string;
  submitHref?: string;
}

export type LandingSection =
  | ValueSection
  | FAQSection
  | TestimonialSection
  | CardGridSection
  | VideoSection
  | FormSection;

// ---------------------------------------------------------------------------
// Root content
// ---------------------------------------------------------------------------

export interface LandingContent {
  meta?: MetaContent;
  header?: HeaderContent;
  hero: HeroContent;
  sections: LandingSection[];
  footer: FooterContent;
}
