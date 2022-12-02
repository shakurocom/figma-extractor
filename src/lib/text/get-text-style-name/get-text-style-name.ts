export function getTextStyleName(name?: string) {
  // format name from like "Heading / h200 - bs" to "h200-bs"

  const splitLeftPart = name?.split(' / ');
  const splitRightPart = splitLeftPart?.[splitLeftPart?.length - 1]
    .replace(/\s+/g, '')
    .replace('.', '-');

  return splitRightPart || '';
}
