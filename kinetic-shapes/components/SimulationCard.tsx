/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { SimulationConfig, GlobalSettings } from '../types';
import Canvas from './Canvas';
import { Info, RefreshCw } from 'lucide-react';

interface SimulationCardProps {
  config: SimulationConfig;
  globalSettings: GlobalSettings;
}

const SimulationCard: React.FC<SimulationCardProps> = ({ config, globalSettings }) => {
  const [resetKey, setResetKey] = React.useState(0);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-cyan-500/50 active:border-cyan-500/50 transition-all duration-300 flex flex-col relative group w-full">
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-30 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/10 group-hover:bg-black/80 transition-colors">
             <h3 className="text-cyan-400 font-bold text-xs uppercase tracking-wider">{config.name}</h3>
        </div>
        <button 
            onClick={() => setResetKey(k => k + 1)}
            className="bg-black/60 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-all duration-300 pointer-events-auto cursor-pointer opacity-0 group-hover:opacity-100 group-active:opacity-100 translate-y-2 group-hover:translate-y-0 group-active:translate-y-0"
            title="Restart Simulation"
        >
            <RefreshCw size={14} />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-grow relative aspect-square bg-black overflow-hidden">
        {/* The key prop forces full remount of Canvas on reset */}
        <Canvas key={resetKey} config={config} globalSettings={globalSettings} />

        {/* Reveal Overlay */}
        <div className="absolute inset-0 z-20 bg-gray-950 flex items-center justify-center transition-all duration-700 ease-in-out group-hover:opacity-0 group-active:opacity-0 group-hover:scale-110 group-active:scale-110 group-hover:pointer-events-none group-active:pointer-events-none">
            {/* Dot Grid Pattern */}
            <div className="absolute inset-0 opacity-20" 
                style={{
                    backgroundImage: 'radial-gradient(circle, #22d3ee 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }} 
            />
            {/* Center Decoration */}
            <div className="relative flex flex-col items-center gap-4 opacity-60">
                <div className="relative">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                    <div className="w-12 h-12 border border-cyan-500/30 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-cyan-500/80 font-medium">Click or hover here</span>
            </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-950 p-3 border-t border-gray-800 z-30 relative">
        <div className="flex items-start gap-2">
            <Info size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                {config.nuanceDescription}
            </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700">
                G: {config.gravity}x
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700">
                Balls: {config.ballCount}
            </span>
        </div>
      </div>
    </div>
  );
};

export default SimulationCard;