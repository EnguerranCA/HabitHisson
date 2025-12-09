'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { LeaderboardEntry } from '@/lib/leaderboard-actions'
import { getHedgehogStage, getHedgehogImagePath } from '@/lib/xp-utils'

interface LeaderboardCardProps {
  topPlayers: LeaderboardEntry[]
  currentUserRank: number | null
  currentUserEntry: LeaderboardEntry | null
  totalPlayers: number
}

export function LeaderboardCard({ topPlayers, currentUserRank, currentUserEntry, totalPlayers }: LeaderboardCardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600'
    if (rank === 2) return 'from-gray-300 to-gray-500'
    if (rank === 3) return 'from-amber-600 to-amber-800'
    return 'from-gray-100 to-gray-200'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        🏆 Classement Mondial
      </h3>

      {/* Top 10 */}
      <div className="space-y-3 mb-6">
        {topPlayers.map((player, index) => (
          <motion.div
            key={player.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              player.isCurrentUser 
                ? 'bg-orange-50 border-orange-300 shadow-md' 
                : 'bg-gray-50 border-gray-200 hover:border-orange-200'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Rang */}
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(player.rank)} flex items-center justify-center font-bold text-lg shadow-md shrink-0`}>
                {getRankIcon(player.rank)}
              </div>

              {/* Hérisson du joueur */}
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src={getHedgehogImagePath(getHedgehogStage(player.level))}
                  alt="Hérisson"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Infos joueur */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{player.name}</span>
                  {player.isCurrentUser && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">Vous</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="text-orange-500 font-semibold">Niveau {player.level}</span>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1">
                    <Image src="/icons/gland.webp" alt="gland" width={14} height={14} />
                    <span className="font-semibold">{player.xp.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Badge top 3 */}
              {player.rank <= 3 && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                    <span className="text-xl">⭐</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Position de l'utilisateur si hors du top 10 */}
      {currentUserRank && currentUserRank > 10 && currentUserEntry && (
        <div className="border-t-2 border-gray-200 pt-4">
          <p className="text-sm text-gray-500 mb-2">Votre position :</p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-orange-50 border-2 border-orange-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
                #{currentUserRank}
              </div>
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src={getHedgehogImagePath(getHedgehogStage(currentUserEntry.level))}
                  alt="Hérisson"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <span className="font-bold text-gray-800">{currentUserEntry.name}</span>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-orange-500 font-semibold">Niveau {currentUserEntry.level}</span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1">
                    <Image src="/icons/gland.webp" alt="gland" width={14} height={14} />
                    <span className="font-semibold">{currentUserEntry.xp.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Sur {totalPlayers} joueurs
          </p>
        </div>
      )}

      {topPlayers.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">🦔</p>
          <p>Aucun joueur dans le classement</p>
        </div>
      )}
    </div>
  )
}
