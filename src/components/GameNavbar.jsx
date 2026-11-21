import React, { useState } from 'react';
import {
  Home,
  Play,
  Trophy,
  HelpCircle,
  Settings,
  Volume2,
  VolumeX,
  Star,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';
import PlayerAvatar from './PlayerAvatar';

export default function GameNavbar({
  currentScreen = 'home',
  onNavigate,
  currentStage = 1,
  totalStars = 125,
  starBonusActive = false,
  playerId = '84920',
  username = '',
  onLogout,
  soundEnabled = true,
  onToggleSound,
  onOpenSettings,
  onOpenLevels,
  onOpenAchievements,
  onOpenHowToPlay,
}) {
  const [activeTab, setActiveTab] = useState(currentScreen);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    gameAudio.playClick();

    if (tabId === 'home') {
      onNavigate('home');
    } else if (tabId === 'levels') {
      if (onOpenLevels) onOpenLevels();
      else onNavigate('game');
    } else if (tabId === 'achievements') {
      if (onOpenAchievements) onOpenAchievements();
    } else if (tabId === 'howToPlay') {
      if (onOpenHowToPlay) onOpenHowToPlay();
    } else if (tabId === 'settings') {
      if (onOpenSettings) onOpenSettings();
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto px-1.5 sm:px-4 pt-1 sm:pt-2.5 pb-0.5 z-30 select-none">
      {/* Outer Floating Dark-Themed Capsule Navbar */}
      <div className="relative w-full rounded-2xl sm:rounded-full bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 backdrop-blur-xl border border-slate-700/80 shadow-[0_12px_36px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.1)] px-2 sm:px-5 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2">
        
        {/* Top Glass Horizontal Reflection Line */}
        <div className="absolute top-0.5 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-slate-400/40 to-transparent pointer-events-none rounded-full" />

        {/* LEFT: Game Logo with Potion Vials & Ribbons */}
        <div
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group flex-shrink-0"
        >
          {/* Potion Bottles Trio Graphic */}
          <div className="relative flex items-end -space-x-1 sm:-space-x-1.5 pb-0.5 scale-90 sm:scale-100 origin-left">
            {/* Blue potion */}
            <div className="w-3.5 h-6 sm:w-4 sm:h-7 rounded-b-md rounded-t-sm bg-[#0066ff] border border-white/85 shadow-sm transform -rotate-12 flex flex-col justify-between p-0.5">
              <div className="w-1.5 sm:w-2 h-0.5 sm:h-1 bg-amber-700 mx-auto rounded-t-sm" />
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/70 rounded-full mx-auto mb-0.5" />
            </div>
            {/* Magenta center potion */}
            <div className="w-4.5 h-7.5 sm:w-5 sm:h-8.5 rounded-b-lg rounded-t-sm bg-[#ff0099] border border-white shadow-md z-10 flex flex-col justify-between p-0.5">
              <div className="w-2 sm:w-2.5 h-0.5 sm:h-1 bg-amber-700 mx-auto rounded-t-sm" />
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/70 rounded-full mx-auto mb-0.5 animate-pulse" />
            </div>
            {/* Yellow potion */}
            <div className="w-3.5 h-6 sm:w-4 sm:h-7 rounded-b-md rounded-t-sm bg-[#ffe600] border border-white/85 shadow-sm transform rotate-12 flex flex-col justify-between p-0.5">
              <div className="w-1.5 sm:w-2 h-0.5 sm:h-1 bg-amber-700 mx-auto rounded-t-sm" />
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/70 rounded-full mx-auto mb-0.5" />
            </div>
          </div>

          {/* Logo Typography & Ribbon */}
          <div className="flex flex-col items-start leading-none">
            <div className="flex items-center text-xs sm:text-base font-black italic tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                Color
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-500 ml-0.5 sm:ml-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                Sort
              </span>
            </div>
            {/* Purple Ribbon Badge */}
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-white px-1.5 sm:px-2 py-0.2 rounded-full bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 border border-purple-500/50 shadow-sm -mt-0.5">
              Puzzle
            </span>
          </div>
        </div>

        {/* CENTER: Navigation Tabs (Home, Levels, Achievements, How to Play, Settings) */}
        <nav className="flex items-center gap-0.5 sm:gap-1.5">
          {/* Home Tab */}
          <button
            onClick={() => handleTabClick('home')}
            className={`relative flex flex-col items-center justify-center p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all duration-200 ${
              currentScreen === 'home'
                ? 'bg-gradient-to-b from-slate-900/95 to-slate-950/98 border border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.25)] text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Home"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] font-extrabold tracking-tight mt-0.5 hidden md:inline">
              Home
            </span>
            {currentScreen === 'home' && (
              <div className="absolute -bottom-1 w-4 sm:w-6 h-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_6px_#facc15]" />
            )}
          </button>

          {/* Levels Tab */}
          <button
            onClick={() => handleTabClick('levels')}
            className={`relative flex flex-col items-center justify-center p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all duration-200 ${
              currentScreen === 'game'
                ? 'bg-gradient-to-b from-slate-900/95 to-slate-950/98 border border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.25)] text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Levels"
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
            <span className="text-[10px] font-extrabold tracking-tight mt-0.5 hidden md:inline">
              Levels
            </span>
            {currentScreen === 'game' && (
              <div className="absolute -bottom-1 w-4 sm:w-6 h-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_6px_#facc15]" />
            )}
          </button>

          {/* Achievements Tab */}
          <button
            onClick={() => handleTabClick('achievements')}
            className="flex flex-col items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="Achievements"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] font-extrabold tracking-tight mt-0.5 hidden md:inline">
              Achievements
            </span>
          </button>

          {/* How to Play Tab */}
          <button
            onClick={() => handleTabClick('howToPlay')}
            className="flex flex-col items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="How to Play"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] font-extrabold tracking-tight mt-0.5 hidden md:inline">
              How to Play
            </span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => handleTabClick('settings')}
            className="flex flex-col items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] font-extrabold tracking-tight mt-0.5 hidden md:inline">
              Settings
            </span>
          </button>
        </nav>

        {/* RIGHT: Player Profile ID, Stars Count & Sound Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Player Profile with Realistic 3D Avatar */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-slate-950/90 to-slate-900/90 border border-slate-700/60 shadow-inner max-w-[110px] sm:max-w-[140px]">
            <PlayerAvatar size="sm" />
            <div className="flex flex-col leading-none truncate">
              <span className="text-[7px] font-black uppercase text-amber-300 tracking-wider hidden sm:inline">
                Player
              </span>
              <span className="text-[10px] sm:text-xs font-black text-white tracking-tight truncate">
                {username ? username : `#${playerId}`}
              </span>
            </div>
          </div>

          {/* Golden Stars Pill Counter */}
          <div
            className={`relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-b from-slate-950/95 to-slate-900/95 border border-amber-500/40 shadow-sm transition-all duration-300 ${
              starBonusActive ? 'scale-110 border-amber-300 shadow-[0_0_15px_#facc15]' : ''
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] ${
                starBonusActive ? 'animate-bounce' : ''
              }`}
            />
            <span className="text-[11px] sm:text-xs font-black text-white tracking-wide">
              {totalStars}
            </span>
            {starBonusActive && (
              <span className="absolute -top-3.5 -right-2 text-[10px] font-black text-amber-300 bg-amber-950 px-1.5 py-0.2 rounded-full border border-amber-400 shadow-md animate-pulse">
                +3⭐
              </span>
            )}
          </div>

          {/* Circular Sound Toggle Button */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onToggleSound();
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all active:scale-90 shadow-md ${
              soundEnabled
                ? 'bg-gradient-to-b from-cyan-600 to-blue-800 border-cyan-400/60 text-white shadow-cyan-900/40'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={() => {
                gameAudio.playClick();
                if (window.confirm('Are you sure you want to log out?')) {
                  onLogout();
                }
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-700/60 bg-slate-900/90 hover:bg-rose-950/80 hover:border-rose-500/60 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

