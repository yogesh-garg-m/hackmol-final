import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface MessageDialogProps {
  isVisible: boolean;
  position: { x: number; y: number };
  features: string[];
  title?: string;
}

export const MessageDialog: React.FC<MessageDialogProps> = ({
  isVisible,
  position,
  features,
  title = "Key Features",
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ duration: 0.2 }}
      className="fixed z-[60] pointer-events-none"
      style={{
        left: position.x - 10,
        top: position.y - 150,
        transform: "translateY(-100%)",
      }}
    >
      <div className="relative">
        {/* Message Box with glassmorphic effect */}
        <div className="message-box">
          <h4 className="text-white font-semibold mb-3 text-center text-base md:text-lg">
            {title}
          </h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-2 text-s text-gray-300"
              >
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Message Box Arrow/Tip */}
        <div className="message-arrow" />
      </div>
    </motion.div>
  );
};
