export function getEffectName(name?: string) {
  // format name from like "shadows / shadow 2" to "shadow2"

  const splitLeftPart = name?.split(' / ');
  const splitName = splitLeftPart?.[splitLeftPart?.length - 1]?.replace(' ', '');

  return splitName || '';
}
