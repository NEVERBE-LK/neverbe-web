import designTokens from "./design-tokens.json";

/** The only resolved color values are in design-tokens.json. */
export { designTokens };
export const printPalette = designTokens.print;

const aliases: Record<string, string> = {
  "status-error": "var(--color-error)",
  "status-warning": "var(--color-warning)",
  "status-info": "var(--color-info)",
  "status-success": "var(--color-success)",
  "color-surface": "var(--v2-bg-surface)",
  "color-surface-2": "var(--v2-bg-elevated)",
  "color-surface-3": "var(--v2-bg-elevated)",
  "color-primary": "var(--v2-text-primary)",
  "color-primary-dark": "var(--v2-text-primary)",
  "color-text-primary": "var(--v2-text-primary)",
  "color-text-secondary": "var(--v2-text-secondary)",
  "color-default": "var(--v2-glass-border)",
  "color-muted": "var(--v2-text-muted)",
  "color-bg-primary": "var(--v2-bg-void)",
  "color-bg-secondary": "var(--v2-bg-surface)",
  "color-accent": "var(--v2-accent)",
  "color-accent-hover": "var(--v2-accent-dim)",
  "color-dark": "var(--v2-text-primary)",
  "color-inverse": "var(--v2-bg-void)",
  "color-border-primary": "var(--v2-glass-border)",
  "color-border-secondary": "var(--color-border-strong)",
  "sport-highlight": "var(--color-highlight)",
  "sport-footer": "var(--color-dark-surface)",
  "v2-accent-glow": "transparent",
  "v2-accent-glow-strong": "transparent",
  "v2-shadow-glow": "none",
  "v2-shadow-card": "0 8px 24px color-mix(in srgb, var(--color-shadow) 5%, transparent)",
  "v2-backdrop-bg": "color-mix(in srgb, var(--color-black) 55%, transparent)",
  "v2-gradient-accent": "linear-gradient(135deg, var(--v2-accent), var(--v2-accent-dim))",
  "v2-radius-card": "4px",
  "v2-radius-pill": "30px",
  "v2-transition-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
};
const declarations = (tokens: Record<string, string>) =>
  Object.entries(tokens).map(([name, value]) => `--${name}:${value}`).join(";");
export const themeCss = `:root{${declarations({ ...designTokens.fixed, ...aliases })}}:root,html.light,[data-theme="light"]{color-scheme:light;${declarations(designTokens.light)}}html.dark,[data-theme="dark"]{color-scheme:dark;${declarations(designTokens.dark)}}`;
