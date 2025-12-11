/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { presets } from './utils/presets';
import SimulationCard from './components/SimulationCard';
import { GlobalSettings } from './types';
import { Settings, Play, Pause, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    timeScale: 1.0,
    gravityMultiplier: 1.0,
    rotationMultiplier: 1.0,
    bouncinessMultiplier: 1.0,
  });

  const [isPlaying, setIsPlaying] = useState(true);

  // Toggle time scale between 0 and 1 for pause
  const togglePlay = () => {
    if (isPlaying) {
      setGlobalSettings(prev => ({ ...prev, timeScale: 0 }));
    } else {
      setGlobalSettings(prev => ({ ...prev, timeScale: 1 }));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black flex flex-col">
      
      {/* Sticky Header Controls */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            
            {/* Title */}
            <div className="flex items-center justify-between lg:justify-start">
              <div className="flex items-center gap-3">
                <div className="p-1.5 md:p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <Activity className="text-cyan-400 w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight">Physico <span className="text-cyan-400">Galaxio</span></h1>
                </div>
              </div>
              
              {/* Mobile Play/Pause (Visible only on small screens for easy access) */}
              <button 
                  onClick={togglePlay}
                  className={`lg:hidden p-2 rounded-lg border border-white/10 ${isPlaying ? 'bg-gray-800 text-red-400' : 'bg-cyan-500 text-black'}`}
               >
                  {isPlaying ? <Pause size={18}/> : <Play size={18}/>}
               </button>
            </div>

            {/* Controls Grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 items-end">
              
              {/* Time/Speed Control */}
              <div className="space-y-1.5 hidden lg:block">
                 <label className="text-[10px] md:text-xs font-medium text-gray-400 flex justify-between">
                    <span>Sim Speed</span>
                    <span className="text-cyan-400">{isPlaying ? globalSettings.timeScale.toFixed(1) + 'x' : 'PAUSED'}</span>
                 </label>
                 <div className="flex items-center gap-2 h-7">
                     <button 
                        onClick={togglePlay}
                        className={`p-1.5 rounded ${isPlaying ? 'bg-gray-800 hover:bg-gray-700 text-red-400' : 'bg-cyan-500 hover:bg-cyan-400 text-black'}`}
                     >
                        {isPlaying ? <Pause size={14}/> : <Play size={14}/>}
                     </button>
                     <input 
                        type="range" min="0.1" max="3" step="0.1"
                        value={isPlaying ? globalSettings.timeScale : 1}
                        onChange={(e) => {
                            if(!isPlaying) togglePlay();
                            setGlobalSettings(p => ({...p, timeScale: parseFloat(e.target.value)}))
                        }}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                     />
                 </div>
              </div>
               {/* Mobile only Time Control (simplified) */}
               <div className="space-y-1.5 lg:hidden">
                 <label className="text-[10px] font-medium text-gray-400 flex justify-between">
                    <span>Speed</span>
                    <span className="text-cyan-400">{isPlaying ? globalSettings.timeScale.toFixed(1) + 'x' : 'PAUSED'}</span>
                 </label>
                 <div className="flex items-center h-8">
                    <input 
                        type="range" min="0.1" max="3" step="0.1"
                        value={isPlaying ? globalSettings.timeScale : 1}
                        onChange={(e) => {
                            if(!isPlaying) togglePlay();
                            setGlobalSettings(p => ({...p, timeScale: parseFloat(e.target.value)}))
                        }}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                 </div>
               </div>


               {/* Gravity Control */}
              <div className="space-y-1.5">
                 <label className="text-[10px] md:text-xs font-medium text-gray-400 flex justify-between">
                    <span>Gravity</span>
                    <span className="text-cyan-400">{globalSettings.gravityMultiplier.toFixed(1)}x</span>
                 </label>
                 <div className="flex items-center h-8 md:h-7">
                    <input 
                        type="range" min="0" max="3" step="0.1"
                        value={globalSettings.gravityMultiplier}
                        onChange={(e) => setGlobalSettings(p => ({...p, gravityMultiplier: parseFloat(e.target.value)}))}
                        className="w-full h-2 md:h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                 </div>
              </div>

              {/* Rotation Control */}
              <div className="space-y-1.5">
                 <label className="text-[10px] md:text-xs font-medium text-gray-400 flex justify-between">
                    <span>Rotation</span>
                    <span className="text-cyan-400">{globalSettings.rotationMultiplier.toFixed(1)}x</span>
                 </label>
                 <div className="flex items-center h-8 md:h-7">
                    <input 
                        type="range" min="0" max="5" step="0.1"
                        value={globalSettings.rotationMultiplier}
                        onChange={(e) => setGlobalSettings(p => ({...p, rotationMultiplier: parseFloat(e.target.value)}))}
                        className="w-full h-2 md:h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                 </div>
              </div>

               {/* Restitution Control */}
               <div className="space-y-1.5">
                 <label className="text-[10px] md:text-xs font-medium text-gray-400 flex justify-between">
                    <span>Bounciness</span>
                    <span className="text-cyan-400">{globalSettings.bouncinessMultiplier.toFixed(1)}x</span>
                 </label>
                 <div className="flex items-center h-8 md:h-7">
                    <input 
                        type="range" min="0.1" max="1" step="0.1"
                        value={globalSettings.bouncinessMultiplier}
                        onChange={(e) => setGlobalSettings(p => ({...p, bouncinessMultiplier: parseFloat(e.target.value)}))}
                        className="w-full h-2 md:h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                 </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex-grow w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 justify-items-center">
          {presets.map(preset => (
            <SimulationCard 
                key={preset.id} 
                config={preset} 
                globalSettings={globalSettings} 
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950/50 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center">
            <p className="text-gray-500 text-sm">
                Made by <span className="text-cyan-400 font-medium">Anantram Das</span>
            </p>
        </div>
      </footer>

    </div>
  );
};

export default App;