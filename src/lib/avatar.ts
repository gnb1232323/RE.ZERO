const avatarPalette = [
  "bg-brand-100 text-brand-700",
  "bg-lime-100 text-lime-700",
  "bg-khaki-200 text-khaki-600",
  "bg-ink-200 text-ink-700",
];

export function avatarClasses(name: string) {
  const idx = name.charCodeAt(0) % avatarPalette.length;
  return avatarPalette[idx];
}
