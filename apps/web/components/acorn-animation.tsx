'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface AcornAnimationProps {
  startPosition: { x: number; y: number }
  endPosition: { x: number; y: number }
  count: number // Nombre de glands à animer
  onComplete: () => void
}

export function AcornAnimation({ startPosition, endPosition, count, onComplete }: AcornAnimationProps) {
  const [acorns, setAcorns] = useState<number[]>([])

  useEffect(() => {
    // Créer un groupe de glands avec des délais légèrement décalés
    const acornArray = Array.from({ length: count }, (_, i) => i)
    setAcorns(acornArray)

    // Déclencher le callback après l'animation
    const duration = 1000 + (count * 100) // 1s + délai entre chaque gland
    setTimeout(onComplete, duration)
  }, [count, onComplete])

  return (
    <>
      {acorns.map((index) => (
        <motion.div
          key={index}
          className="fixed z-50 pointer-events-none"
          initial={{
            x: startPosition.x,
            y: startPosition.y,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: endPosition.x,
            y: endPosition.y,
            scale: [1, 1.2, 0.8],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: index * 0.1, // Décalage de 100ms entre chaque gland
            ease: [0.43, 0.13, 0.23, 0.96], // Courbe de Bézier personnalisée
          }}
        >
          <Image
            src="/icons/gland.webp"
            alt="Gland"
            width={32}
            height={32}
            className="drop-shadow-lg"
          />
        </motion.div>
      ))}
    </>
  )
}

// Hook personnalisé pour déclencher l'animation facilement
export function useAcornAnimation() {
  const [animations, setAnimations] = useState<
    Array<{
      id: string
      startPos: { x: number; y: number }
      endPos: { x: number; y: number }
      count: number
    }>
  >([])

  const triggerAnimation = (
    startElement: HTMLElement,
    endElement: HTMLElement,
    count: number = 1
  ) => {
    const startRect = startElement.getBoundingClientRect()
    const endRect = endElement.getBoundingClientRect()

    const animation = {
      id: Date.now().toString() + Math.random(),
      startPos: {
        x: startRect.left + startRect.width / 2,
        y: startRect.top + startRect.height / 2,
      },
      endPos: {
        x: endRect.left + endRect.width / 2,
        y: endRect.top + endRect.height / 2,
      },
      count,
    }

    setAnimations((prev) => [...prev, animation])
  }

  const removeAnimation = (id: string) => {
    setAnimations((prev) => prev.filter((anim) => anim.id !== id))
  }

  return {
    animations,
    triggerAnimation,
    removeAnimation,
  }
}

export function AcornAnimationContainer() {
  const { animations, removeAnimation } = useAcornAnimation()

  return (
    <>
      {animations.map((anim) => (
        <AcornAnimation
          key={anim.id}
          startPosition={anim.startPos}
          endPosition={anim.endPos}
          count={anim.count}
          onComplete={() => removeAnimation(anim.id)}
        />
      ))}
    </>
  )
}
