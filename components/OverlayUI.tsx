import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus } from 'lucide-react';
import { NodeData } from '../types';

interface OverlayUIProps {
  selectedNode: NodeData | null;
  onClose: () => void;
}

export const OverlayUI: React.FC<OverlayUIProps> = ({ selectedNode, onClose }) => {
  return (
    <>
      {/* Top Navigation Bar Removed */}

      {/* Floating Info Tooltip (Center) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
          >
            <div className="w-[400px] bg-[#1a1a1a] rounded-xl shadow-2xl p-6 text-white relative flex flex-col items-center text-center">

              {/* Close Button defined outside or inside? TheoryVC just clicks away usually, but let's add one */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              <div className="text-[10px] font-mono uppercase tracking-widest text-[#A0C4FF] mb-3">
                {selectedNode.cluster}
              </div>

              <h2 className="text-3xl font-bold mb-4 tracking-tight">{selectedNode.label}</h2>

              <div className="w-8 h-[1px] bg-white/20 mb-4" />

              <p className="text-sm text-white/70 leading-relaxed mb-6 font-light">
                {selectedNode.description}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full border-t border-white/10 pt-4">
                <div>
                  <div className="text-[10px] uppercase text-white/40 mb-1">Status</div>
                  <div className="text-sm">Active Protocol</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-white/40 mb-1">Website</div>
                  <a href="#" className="text-sm border-b border-white/30 hover:border-white pb-0.5 transition-colors">
                    noded.js.org
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Right Search Control Removed */}
    </>
  );
};
