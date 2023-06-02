export function getColorName(name?: string) {
  // format name from like "primary / blue900" to "blue900"

  const splitName = name?.split(' / ');

  return splitName ? splitName[splitName.length - 1].toLowerCase() : '';
}

export function replaceSlashToDash(name?: string) {
  // format name from like "text/blue900" to "text-blue900"

  return name ? name.replace(/[\/]/gm, '-') : '';
}
