/**
 * Formule XP : niveau N = N² × 100
 * Niveau 1 → 100 XP
 * Niveau 2 → 400 XP  
 * Niveau 3 → 900 XP
 * Niveau 5 → 2500 XP
 * Niveau 10 → 10000 XP
 * Niveau 20 → 40000 XP
 */

/**
 * Calcule le niveau à partir de l'XP total
 */
export function calculateLevelFromXP(xp: number): number {
  // Résolution de l'équation : level² × 100 = xp
  // level = √(xp / 100)
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 100))
  return Math.max(1, level) // Minimum niveau 1
}

/**
 * Calcule l'XP requis pour un niveau donné
 */
export function getXPForLevel(level: number): number {
  return level * level * 100
}

/**
 * Calcule la progression dans le niveau actuel (0-100%)
 */
export function getLevelProgress(xp: number): {
  currentLevel: number
  xpInCurrentLevel: number
  xpRequiredForNextLevel: number
  progressPercent: number
} {
  const safeXP = Math.max(0, xp) // Protection contre XP négatif
  const currentLevel = calculateLevelFromXP(safeXP)
  const xpForCurrentLevel = getXPForLevel(currentLevel)
  const xpForNextLevel = getXPForLevel(currentLevel + 1)
  const xpInCurrentLevel = Math.max(0, safeXP - xpForCurrentLevel)
  const xpRequiredForNextLevel = xpForNextLevel - xpForCurrentLevel

  return {
    currentLevel,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    progressPercent: Math.min(100, Math.max(0, Math.floor((xpInCurrentLevel / xpRequiredForNextLevel) * 100))),
  }
}

/**
 * Détermine le stade de croissance du hérisson (1-5) selon le niveau
 * Stade 1 (bébé): niveau 1
 * Stade 2 (enfant): niveau 5
 * Stade 3 (ado): niveau 10
 * Stade 4 (adulte): niveau 15
 * Stade 5 (elder): niveau 20+
 */
export function getHedgehogStage(level: number): 1 | 2 | 3 | 4 | 5 {
  if (level >= 20) return 5
  if (level >= 15) return 4
  if (level >= 10) return 3
  if (level >= 5) return 2
  return 1
}

/**
 * Retourne le nom du fichier image du hérisson selon le stade
 */
export function getHedgehogImagePath(stage: 1 | 2 | 3 | 4 | 5): string {
  return `/hedgehogs/herisson-${stage}.png`
}

/**
 * Calcule le nombre de glands à gagner selon le type et la fréquence d'habitude
 */
export function calculateXPGain(frequency: 'DAILY' | 'WEEKLY'): number {
  return frequency === 'WEEKLY' ? 5000 : 500
}

/**
 * Nom du stade en français
 */
export function getStageLabel(stage: 1 | 2 | 3 | 4 | 5): string {
  const labels = {
    1: 'Bébé',
    2: 'Enfant',
    3: 'Adolescent',
    4: 'Adulte',
    5: 'Ancien',
  }
  return labels[stage]
}
