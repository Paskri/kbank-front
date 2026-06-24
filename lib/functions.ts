/**
 * Met en forme un nom avec une majuscule initiale.
 *
 * @param name Nom à formater.
 * @returns Nom formaté.
 */
export function formatNames(name: string): string {
  const formatted = name.toLowerCase()

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}
