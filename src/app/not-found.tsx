"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";
import ButterflyIcon from "@/components/ButterflyIcon";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200 to-fuchsia-200 flex items-center justify-center">
              <Music2 className="h-16 w-16 text-purple-500" />
            </div>
            <ButterflyIcon className="absolute -top-2 -right-2 text-purple-400" />
          </div>
        </motion.div>

        <h1 className="font-title text-3xl font-bold text-purple-900 mb-4">
          页面迷路了
        </h1>
        <p className="text-purple-600/70 mb-8">
          这首歌还没发行呢，回到主页看看吧
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            回到音乐绿洲
          </Link>
        </motion.button>
      </motion.div>
    </div>
  );
}