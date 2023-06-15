export function replaceSlashToDash(name?: string) {
  // format name from like "text/blue900" to "text-blue900"

  return name ? name.replace(/[\/]/gm, '-') : '';
}
