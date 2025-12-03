'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getHedgehogImagePath, getHedgehogStage, getLevelProgress, getStageLabel } from '@/lib/xp-utils'

interface HedgehogDisplayProps {
  xp: number
  showXPBar?: boolean
  size?: 'small' | 'medium' | 'large'
  onXPGain?: (amount: number) => void
}

export function HedgehogDisplay({ xp, showXPBar = true, size = 'medium', onXPGain }: HedgehogDisplayProps) {
  const { currentLevel, xpInCurrentLevel, xpRequiredForNextLevel, progressPercent } = getLevelProgress(xp)
  const stage = getHedgehogStage(currentLevel)
  const imagePath = getHedgehogImagePath(stage)
  
  const [isEvolving, setIsEvolving] = useState(false)
  const [previousStage, setPreviousStage] = useState(stage)
  const [showXPPopup, setShowXPPopup] = useState(false)
  const [xpGainAmount, setXPGainAmount] = useState(0)

  // Détecter le changement de stade pour l'animation d'évolution
  useEffect(() => {
    if (stage !== previousStage) {
      setIsEvolving(true)
      // Animation de clignotement style Pokémon (3 cycles)
      setTimeout(() => {
        setIsEvolving(false)
        setPreviousStage(stage)
      }, 1500) // 1.5 secondes d'animation
    }
  }, [stage, previousStage])

  // Animation de gain d'XP
  useEffect(() => {
    if (onXPGain) {
      const handleXPGain = (amount: number) => {
        setXPGainAmount(amount)
        setShowXPPopup(true)
        setTimeout(() => setShowXPPopup(false), 2000)
      }
      // Simuler le gain d'XP (sera connecté plus tard)
    }
  }, [onXPGain])

  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-64 h-64',
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Popup de gain d'XP */}
      <AnimatePresence>
        {showXPPopup && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 z-50 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full shadow-lg"
          >
            +{xpGainAmount} 🌰
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteneur du hérisson */}
      <motion.div
        className={`relative ${sizeClasses[size]} z-0`}
        animate={isEvolving ? {
          opacity: [1, 0, 1, 0, 1, 0, 1],
          scale: [1, 1.1, 1, 1.1, 1, 1.1, 1],
        } : {}}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full"
          >
            <Image
              src={imagePath}
              alt={`Hérisson ${getStageLabel(stage)}`}
              fill
              className="object-contain min-h-60"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Badge de niveau */}
      <motion.div
        className="mt-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold px-4 py-2 rounded-full shadow-md relative z-10"
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-lg">Niveau {currentLevel}</span>
        <span className="text-xs ml-2 opacity-80">({getStageLabel(stage)})</span>
      </motion.div>

      {/* Barre de progression glands */}
      {showXPBar && (
        <div className="w-full max-w-xs mt-3 relative z-10">
          <div className="flex justify-between text-sm text-gray-600 mb-1 items-center">
            <span className="flex items-center gap-1">
              <Image src="/icons/gland.webp" alt="gland" width={14} height={14} />
              {xpInCurrentLevel}
            </span>
            <span className="flex items-center gap-1">
              <Image src="/icons/gland.webp" alt="gland" width={14} height={14} />
              {xpRequiredForNextLevel}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          {/* <p className="text-xs text-center text-gray-500 mt-1">
            {progressPercent}% vers le niveau {currentLevel + 1}
          </p> */}
        </div>
      )}

      {/* Message d'évolution */}
      {/* <AnimatePresence>
        {isEvolving && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-32 bg-white border-4 border-yellow-400 rounded-lg px-6 py-3 shadow-xl z-40"
          >
            <p className="text-lg font-bold text-center text-yellow-600">
              ✨ Ton hérisson grandit ! ✨
            </p>
            <p className="text-sm text-center text-gray-600">
              Il est maintenant un {getStageLabel(stage)} !
            </p>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  )
}
