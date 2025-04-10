import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Brain, Sparkles, Shield } from 'lucide-react';

interface AICheckingOverlayProps {
  isVisible: boolean;
}

const AICheckingOverlay: React.FC<AICheckingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1.1, 1.3, 1.1],
            rotate: [360, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-r from-purple-400 via-yellow-500 to-blue-500 rounded-full blur-3xl opacity-20"
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50"
            />
            <div className="relative flex items-center justify-center">
              <Brain className="h-12 w-12 text-purple-500 animate-pulse" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-2 -top-2"
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-yellow-500 to-pink-500 bg-clip-text text-transparent mb-2">
              AI Checking Resource
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your content...
            </p>
          </motion.div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="h-4 w-4 text-purple-500 animate-pulse" />
            <span>Verifying content quality and relevance</span>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 mt-4"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: i === 0 ? '#FBBF24' : i === 1 ? '#A855F7' : '#EC4899'
                }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AICheckingOverlay; 