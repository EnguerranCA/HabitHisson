'use client'

import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export function LoadingSpinner({ size = 32, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`min-h-screen bg-background flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <RefreshCw className="text-orange-500" size={size} />
      </motion.div>
    </div>
  )
}
