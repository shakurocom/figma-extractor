export function getEffectName(name?: string) {
  // format name from like "shadows / shadow 2" to "shadow2"

  const splitLeftPart = name?.split(' / ');
  const splitName = splitLeftPart?.[splitLeftPart?.length - 1]?.replace(' ', '');

  return splitName || '';
}

export function replaceSlashToDash(name?: string) {
  // format name from like "text/blue900" to "text-blue900"

  return name ? name.replace(/[\/]/gm, '-') : '';
}
