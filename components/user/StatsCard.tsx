"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export function StatsCard() {
  const stats = [
    { label: "完了したサーベイ", value: 12 },
    { label: "進行中のサーベイ", value: 3 },
    { label: "未回答のサーベイ", value: 2 },
  ]

  return (
    <Card className="w-full bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="text-3xl font-bold text-blue-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 + index * 0.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

