import React, { useState, useEffect, useCallback } from 'react';
import SnowEffect from './components/SnowEffect';
import MagicParticles from './components/MagicParticles';
import GameNavbar from './components/GameNavbar';
import HomeScreen from './components/HomeScreen';
import PixiGameBoard from './components/PixiGameBoard';
import LoginScreen from './components/LoginScreen';
import PauseModal from './components/PauseModal';
import WinModal from './components/WinModal';
import SettingsModal from './components/SettingsModal';
import ShopModal from './components/ShopModal';
import LevelsModal from './components/LevelsModal';
import AchievementsModal from './components/AchievementsModal';
import HowToPlayModal from './components/HowToPlayModal';
import OutOfChancesModal from './components/OutOfChancesModal';
import { getStageData } from './data/levelStages';
import { GAME_THEMES, TUBE_SKINS } from './data/themes';
import { gameAudio } from './utils/gameAudio';
import { authService, createDefaultPlayerProgress } from './utils/authService';
import { Undo2, RotateCcw, Heart, Pause, Sparkles, Lightbulb, FlaskConical } from 'lucide-react';

export default function App() {
  // Authentication & Active User Session
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const initialData = currentUser ? authService.getUserProgress(currentUser.id) : null;

  const [screen, setScreen] = useState('home'); // 'home' | 'game'
  const [stage, setStage] = useState(() => initialData?.stage || 1);
  const [highestUnlocked, setHighestUnlocked] = useState(() => initialData?.highestUnlocked || initialData?.stage || 1);
  const [coins, setCoins] = useState(() => (initialData?.coins !== undefined ? initialData.coins : 0));
  const [stars, setStars] = useState(() => (initialData?.stars !== undefined ? initialData.stars : 0));
  const [starBonusActive, setStarBonusActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => (initialData?.soundEnabled !== undefined ? initialData.soundEnabled : true));
  const [musicEnabled, setMusicEnabled] = useState(() => (initialData?.musicEnabled !== undefined ? initialData.musicEnabled : true));
  const [vibrationEnabled, setVibrationEnabled] = useState(() => (initialData?.vibrationEnabled !== undefined ? initialData.vibrationEnabled : true));

  // Generous chances formula: increases by 4 chances per stage
  const getMaxChances = (stageNum) => {
    return Math.max(6, 6 + (stageNum - 1) * 4);
  };
  const maxChances = getMaxChances(stage);
  const [chances, setChances] = useState(() => getMaxChances(stage));

  // Themes & Bottle Skins State - Isolated Per Player Profile
  const [activeTheme, setActiveTheme] = useState(() => initialData?.activeTheme || 'apothecary');
  const [unlockedThemes, setUnlockedThemes] = useState(() => initialData?.unlockedThemes || ['apothecary']);

  const [activeSkin, setActiveSkin] = useState(() => initialData?.activeSkin || 'classic');
  const [unlockedSkins, setUnlockedSkins] = useState(() => initialData?.unlockedSkins || ['classic']);

  const handlePurchaseTheme = (themeId, price) => {
    if (coins < price || unlockedThemes.includes(themeId)) return false;
    setCoins((c) => c - price);
    setUnlockedThemes((prev) => [...prev, themeId]);
    setActiveTheme(themeId);
    gameAudio.playClick();
    return true;
  };

  const handleEquipTheme = (themeId) => {
    if (!unlockedThemes.includes(themeId)) return;
    setActiveTheme(themeId);
    gameAudio.playClick();
  };

  const handlePurchaseSkin = (skinId, price) => {
    if (coins < price || unlockedSkins.includes(skinId)) return false;
    setCoins((c) => c - price);
    setUnlockedSkins((prev) => [...prev, skinId]);
    setActiveSkin(skinId);
    gameAudio.playClick();
    return true;
  };

  const handleEquipSkin = (skinId) => {
    if (!unlockedSkins.includes(skinId)) return;
    setActiveSkin(skinId);
    gameAudio.playClick();
  };

  // Modals
  const [isPaused, setIsPaused] = useState(false);
  const [isWinOpen, setIsWinOpen] = useState(false);
  const [isOutOfChancesOpen, setIsOutOfChancesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  // Gameplay Bottles State
  const [bottles, setBottles] = useState(() => getStageData(stage).bottles);
  const [history, setHistory] = useState([]);

  // Boosters State
  const [hint, setHint] = useState(null);
  const [extraBottleUsed, setExtraBottleUsed] = useState(false);

  // Helper: check if a bottle is completed
  const isCompleteBottle = (b) => {
    return b && b.length === 4 && b.every((c) => c === b[0]);
  };

  // Auto-Save current player progress to their dedicated isolated account store
  useEffect(() => {
    if (!currentUser) return;
    authService.saveUserProgress(currentUser.id, {
      stage,
      highestUnlocked,
      coins,
      stars,
      activeTheme,
      unlockedThemes,
      activeSkin,
      unlockedSkins,
      soundEnabled,
      musicEnabled,
      vibrationEnabled,
    });
  }, [
    currentUser,
    stage,
    highestUnlocked,
    coins,
    stars,
    activeTheme,
    unlockedThemes,
    activeSkin,
    unlockedSkins,
    soundEnabled,
    musicEnabled,
    vibrationEnabled,
  ]);

  // Handle successful login or account registration
  const handleLoginSuccess = (user, progress) => {
    setCurrentUser(user);
    setStage(progress.stage || 1);
    setHighestUnlocked(progress.highestUnlocked || progress.stage || 1);
    setCoins(progress.coins !== undefined ? progress.coins : 0);
    setStars(progress.stars !== undefined ? progress.stars : 0);
    setActiveTheme(progress.activeTheme || 'apothecary');
    setUnlockedThemes(progress.unlockedThemes || ['apothecary']);
    setActiveSkin(progress.activeSkin || 'classic');
    setUnlockedSkins(progress.unlockedSkins || ['classic']);
    setSoundEnabled(progress.soundEnabled !== undefined ? progress.soundEnabled : true);
    setMusicEnabled(progress.musicEnabled !== undefined ? progress.musicEnabled : true);
    setVibrationEnabled(progress.vibrationEnabled !== undefined ? progress.vibrationEnabled : true);
    setScreen('home');
    loadStage(progress.stage || 1);
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setScreen('home');
    setIsSettingsOpen(false);
    setIsWinOpen(false);
    setIsOutOfChancesOpen(false);
    setIsPaused(false);
    setIsShopOpen(false);
    setIsLevelsOpen(false);
    setIsAchievementsOpen(false);
    setIsHowToPlayOpen(false);
  };

  // Reset Progress for current player account
  const handleResetProgress = () => {
    setStage(1);
    setHighestUnlocked(1);
    setStars(0);
    setCoins(0);
    loadStage(1);
    if (currentUser) {
      authService.saveUserProgress(currentUser.id, {
        stage: 1,
        highestUnlocked: 1,
        stars: 0,
        coins: 0,
        activeTheme,
        unlockedThemes,
        activeSkin,
        unlockedSkins,
        soundEnabled,
        musicEnabled,
        vibrationEnabled,
      });
    }
  };

  // Load stage bottles and assign starting chances
  const loadStage = useCallback((stageNum) => {
    const data = getStageData(stageNum);
    setStage(stageNum);
    setBottles(data.bottles.map((b) => [...b]));
    setHistory([]);
    setChances(getMaxChances(stageNum));
    setExtraBottleUsed(false);
    setHint(null);
    setIsWinOpen(false);
    setIsOutOfChancesOpen(false);
    setIsPaused(false);
  }, []);

  // Update bottles and decrement chances on each move
  const handleBottlesChange = useCallback((newBottles) => {
    setHistory((prev) => [...prev, bottles.map((b) => [...b])]);
    setBottles(newBottles);
    setChances((prev) => Math.max(0, prev - 1));
    setHint(null);
  }, [bottles]);

  // Booster: Hint Helper (Highlights first valid move, prioritizing matching colors or empty containers)
  const handleHint = () => {
    if (screen !== 'game' || isWinOpen || isOutOfChancesOpen) return;
    // Priority 1: Matching color or empty container
    for (let from = 0; from < bottles.length; from++) {
      const fromB = bottles[from];
      if (fromB.length === 0 || isCompleteBottle(fromB)) continue;
      const topColor = fromB[fromB.length - 1];
      const isPureFrom = fromB.every((c) => c === topColor);

      for (let to = 0; to < bottles.length; to++) {
        if (from === to) continue;
        const toB = bottles[to];
        if (toB.length >= 4) continue;

        if (toB.length === 0) {
          if (isPureFrom) continue;
          setHint({ from, to });
          gameAudio.playHint();
          setTimeout(() => setHint(null), 3500);
          return;
        } else if (toB[toB.length - 1] === topColor) {
          setHint({ from, to });
          gameAudio.playHint();
          setTimeout(() => setHint(null), 3500);
          return;
        }
      }
    }
    // Priority 2: Any container with available space (free pouring mechanic)
    for (let from = 0; from < bottles.length; from++) {
      const fromB = bottles[from];
      if (fromB.length === 0 || isCompleteBottle(fromB)) continue;

      for (let to = 0; to < bottles.length; to++) {
        if (from === to) continue;
        const toB = bottles[to];
        if (toB.length < 4) {
          setHint({ from, to });
          gameAudio.playHint();
          setTimeout(() => setHint(null), 3500);
          return;
        }
      }
    }
  };

  // Booster: Add Extra Empty Tube (+1 Bottle)
  const handleAddBottle = () => {
    if (extraBottleUsed || screen !== 'game' || isWinOpen || isOutOfChancesOpen) return;
    setExtraBottleUsed(true);
    setBottles((prev) => [...prev, []]);
    setChances((c) => Math.min(10, c + 1));
    gameAudio.playAddBottle();
  };

  // Out of chances check: wait for pour animation to finish before showing modal
  useEffect(() => {
    if (chances === 0 && !isWinOpen && screen === 'game') {
      const timer = setTimeout(() => {
        if (!isWinOpen) {
          setIsOutOfChancesOpen(true);
        }
      }, 1400);
      return () => clearTimeout(timer);
    } else if (chances > 0) {
      setIsOutOfChancesOpen(false);
    }
  }, [chances, isWinOpen, screen]);

  // Undo Move (Restores 1 chance and previous bottle state)
  const handleUndo = () => {
    if (history.length === 0 || isWinOpen) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setBottles(prev.map((b) => [...b]));
    setChances((c) => Math.min(getMaxChances(stage), c + 1));
    setIsOutOfChancesOpen(false);
    gameAudio.playClick();
  };

  // Restart Current Stage
  const handleRestart = () => {
    loadStage(stage);
    gameAudio.playClick();
  };

  // Win Handler - Adds points to stars icon in navbar & coins
  const handleWin = useCallback(() => {
    setIsWinOpen(true);
    setIsOutOfChancesOpen(false);
    setStars((s) => s + 3); // Points added to the star icon!
    setCoins((c) => c + 50);
    setStarBonusActive(true);
    setHighestUnlocked((prev) => Math.max(prev, Math.min(100, stage + 1)));
    setTimeout(() => setStarBonusActive(false), 3500);
  }, [stage]);

  // Next Stage Handler
  const handleNextStage = () => {
    const nextStage = stage >= 100 ? 1 : stage + 1;
    setStage(nextStage);
    setHighestUnlocked((prev) => Math.max(prev, nextStage));
    loadStage(nextStage);
  };

  // Toggle Sound preference
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    gameAudio.soundEnabled = next;
  };

  const isHome = screen === 'home';
  const currentThemeObj = GAME_THEMES.find((t) => t.id === activeTheme) || GAME_THEMES[0];
  const completedCount = bottles.filter(isCompleteBottle).length;
  const uniqueColors = new Set(bottles.flat()).size;
  const targetCompleted = Math.max(1, uniqueColors);
  const progressPercent = Math.min(100, Math.round((completedCount / targetCompleted) * 100));

  // If not logged in, enforce the LoginScreen first before accessing the game
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black flex flex-col justify-between font-sans select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      
      {/* Full-Screen Dynamic Background Image & Live Applied Theme */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {isHome ? (
          // Home Screen: Deep Midnight Winter Village Scene - Sleek & Atmospheric Dark Theme
          <div className="relative w-full h-full">
            <img
              src="/winter-scene.jpg"
              alt="Water Sort Home Background"
              className="w-full h-full object-cover object-center filter brightness-65 contrast-125 saturate-110"
            />
            {/* Rich Midnight Velvet Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-indigo-950/70 to-slate-950/90 pointer-events-none" />
            {/* Ambient Radial Spotlight: Deep Cosmic Violet / Cyan Backglow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            {/* Radial Vignette Framing the Center Content */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(2,6,23,0.85)_100%)] pointer-events-none" />
          </div>
        ) : (
          // Gameplay Screen: Live Applied Theme Background & Lighting
          <div className="relative w-full h-full">
            {currentThemeObj.bgImage ? (
              <img
                src={currentThemeObj.bgImage}
                alt={currentThemeObj.name}
                className="w-full h-full object-cover object-center transition-all duration-700"
              />
            ) : currentThemeObj.isDynamicPrimary ? (
              // Primary Spectrum Theme: Rich deep midnight space with glowing pure primary auroras
              <div className="w-full h-full bg-slate-950 relative overflow-hidden">
                <div className="absolute -top-16 -left-16 w-[480px] h-[480px] bg-[#ff0000]/30 rounded-full blur-[110px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute -top-16 -right-16 w-[480px] h-[480px] bg-[#ffff00]/24 rounded-full blur-[110px] animate-pulse" style={{ animationDuration: '7s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] bg-[#0044ff]/35 rounded-full blur-[130px]" />
                <div className="absolute -bottom-16 -left-16 w-[480px] h-[480px] bg-[#00dd00]/28 rounded-full blur-[110px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute -bottom-16 -right-16 w-[440px] h-[440px] bg-[#ff0000]/22 rounded-full blur-[110px]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(2,6,23,0.85)_100%)] pointer-events-none" />
              </div>
            ) : currentThemeObj.isDynamicAurora ? (
              // Aurora Theme: Deep cosmic space gradient with northern lights waves
              <div className="w-full h-full bg-gradient-to-b from-slate-950 via-teal-950 to-indigo-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-400/25 via-emerald-600/15 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-500/20 via-indigo-600/10 to-transparent" />
              </div>
            ) : currentThemeObj.isDynamicSunset ? (
              // Sunset Theme: Rich warm golden hour horizon
              <div className="w-full h-full bg-gradient-to-b from-purple-950 via-rose-950 to-amber-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-500/30 via-orange-600/15 to-transparent" />
              </div>
            ) : (
              <img
                src="/game-bg.png"
                alt="Apothecary"
                className="w-full h-full object-cover object-center"
              />
            )}

            {/* Theme-Specific Ambient Lighting Overlay */}
            <div className={`absolute inset-0 ${currentThemeObj.lightingOverlay} pointer-events-none transition-all duration-700`} />

            {/* Theme-Specific Ambient Glow Vignette */}
            <div className={`absolute inset-0 ${currentThemeObj.ambientGlow} pointer-events-none`} />
          </div>
        )}

        {/* Luminous Pure Primary Colors Ambient Lighting Blooms in Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
          {/* Pure Red Glow (Top-Left) */}
          <div
            className="absolute -top-20 -left-20 w-80 sm:w-[450px] h-80 sm:h-[450px] rounded-full bg-[#ff0000]/24 blur-[95px] pointer-events-none animate-pulse"
            style={{ animationDuration: '6s' }}
          />

          {/* Pure Yellow Radiant Halo (Top-Right) */}
          <div
            className="absolute -top-20 -right-20 w-80 sm:w-[450px] h-80 sm:h-[450px] rounded-full bg-[#ffff00]/20 blur-[95px] pointer-events-none animate-pulse"
            style={{ animationDuration: '7s' }}
          />

          {/* Pure Electric Blue Deep Center Nebula */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] sm:w-[720px] h-[380px] sm:h-[520px] rounded-full bg-[#0044ff]/28 blur-[110px] pointer-events-none" />

          {/* Pure Green Vibrant Emerald Glow (Bottom-Left) */}
          <div
            className="absolute -bottom-20 -left-16 w-80 sm:w-[440px] h-80 sm:h-[440px] rounded-full bg-[#00dd00]/22 blur-[95px] pointer-events-none animate-pulse"
            style={{ animationDuration: '8s' }}
          />

          {/* Pure Red Accent Glow (Bottom-Right) */}
          <div
            className="absolute -bottom-20 -right-16 w-72 sm:w-[400px] h-72 sm:h-[400px] rounded-full bg-[#ff0000]/20 blur-[95px] pointer-events-none"
          />

          {/* Soft Primary Color Sweep Aurora Mesh */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0044ff]/16 via-transparent to-[#ffff00]/12 pointer-events-none mix-blend-screen" />
        </div>

        {/* Ambient Subtle Vignette - Sleek Dark Theme */}
        <div className={`absolute inset-0 z-[2] ${isHome ? 'bg-gradient-to-b from-black/40 via-transparent to-black/60' : 'bg-gradient-to-b from-black/35 via-transparent to-black/55'} pointer-events-none`} />
      </div>

      {/* Dynamic Ambient Particles with Pure Primary Colors */}
      {isHome ? (
        <>
          <SnowEffect />
          <MagicParticles type="primary" />
        </>
      ) : currentThemeObj.particleType === 'snow' ? (
        <>
          <SnowEffect />
          <MagicParticles type="primary" />
        </>
      ) : (
        <MagicParticles type={currentThemeObj.particleType || 'primary'} />
      )}

      {/* Main Container */}
      <div className="relative z-20 w-full h-full flex flex-col justify-between overflow-hidden">
        
        {/* Top Game Navbar (Matching Reference Image Design) */}
        <GameNavbar
          currentScreen={screen}
          onNavigate={(targetScreen) => {
            if (targetScreen === 'game') loadStage(stage);
            setScreen(targetScreen);
          }}
          currentStage={stage}
          totalStars={stars}
          starBonusActive={starBonusActive}
          playerId={currentUser?.id ? currentUser.id.slice(4, 9).toUpperCase() : '84920'}
          username={currentUser?.username || ''}
          onLogout={handleLogout}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLevels={() => setIsLevelsOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        />

        {/* Content Area: Home Screen OR Gameplay Screen */}
        <div className="relative flex-1 w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between overflow-hidden">
          {isHome ? (
            <HomeScreen
              onPlay={() => {
                loadStage(stage);
                setScreen('game');
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenShop={() => setIsShopOpen(true)}
              onOpenLevels={() => setIsLevelsOpen(true)}
              onOpenAchievements={() => setIsAchievementsOpen(true)}
              currentStage={stage}
              coins={coins}
              stars={stars}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-between">
              {/* In-Game HUD: Stage Info, Chances Indicator & Pause */}
              <div className="w-full max-w-lg px-2 sm:px-6 pt-1 sm:pt-1.5 pb-0.5 z-20 flex flex-col gap-1 flex-shrink-0">
                <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2">
                  {/* Level / Stage Badge */}
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-700/60 shadow-md">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                    <span className="text-[11px] sm:text-sm font-black text-slate-100 tracking-wide whitespace-nowrap">
                      Stage {stage}
                    </span>
                  </div>

                  {/* Remaining Chances Display */}
                  <div
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-md border shadow-lg transition-all ${
                      chances <= 2
                        ? 'bg-rose-950/90 border-rose-500/60 text-rose-300 shadow-rose-950/50 animate-pulse'
                        : 'bg-slate-950/90 border-slate-700/60 text-slate-100 shadow-slate-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Heart
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ${
                          chances <= 2 ? 'text-rose-400' : 'text-rose-500'
                        }`}
                      />
                      <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-slate-400">
                        Chances:
                      </span>
                    </div>

                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      <span
                        className={`text-xs sm:text-base font-black ${
                          chances === 0
                            ? 'text-rose-400'
                            : chances <= 3
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {chances}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-500">
                        /{maxChances}
                      </span>
                    </div>

                    {/* Mini Stamina Bar Gauge */}
                    <div className="w-8 sm:w-14 h-1.5 sm:h-2 rounded-full bg-slate-900 border border-slate-700/50 overflow-hidden shadow-inner ml-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          chances / maxChances > 0.5
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-[0_0_6px_#10b981]'
                            : chances / maxChances > 0.25
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_6px_#f59e0b]'
                            : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_6px_#ef4444]'
                        }`}
                        style={{ width: `${Math.round((chances / maxChances) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick In-Game Pause Button */}
                  <button
                    onClick={() => {
                      gameAudio.playClick();
                      setIsPaused(true);
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/90 hover:bg-slate-900 backdrop-blur-md border border-slate-700/60 shadow-md flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer flex-shrink-0"
                    title="Pause Game"
                  >
                    <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                  </button>
                </div>

                {/* Sorted Bottles Progress Bar */}
                <div className="w-full max-w-xs sm:max-w-sm mx-auto px-1 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <span className="text-slate-400">Bottles Sorted:</span>
                      <span className="text-cyan-400 font-bold">{completedCount} / {targetCompleted}</span>
                    </span>
                    <span className="text-amber-400 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950/90 border border-slate-800 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* PixiJS Interactive Water Sort Board */}
              <div className="flex-1 w-full h-full min-h-0 flex items-center justify-center overflow-hidden">
                <PixiGameBoard
                  bottles={bottles}
                  onBottlesChange={handleBottlesChange}
                  onWin={handleWin}
                  isPaused={isPaused || isWinOpen || isOutOfChancesOpen}
                  hint={hint}
                  activeSkin={activeSkin}
                />
              </div>

              {/* Bottom In-Game Controls & Power-Up Boosters */}
              <div className="w-full flex flex-col items-center pb-2.5 sm:pb-3 pt-0.5 px-2 sm:px-4 z-20 flex-shrink-0">
                <div className="flex items-center justify-center gap-1.5 sm:gap-3 bg-slate-950/90 backdrop-blur-xl px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.8)] max-w-full overflow-x-auto scrollbar-none">
                  {/* Hint Booster Button */}
                  <button
                    onClick={handleHint}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-b from-amber-500/15 to-yellow-600/20 hover:from-amber-500/25 hover:to-yellow-600/30 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-950/20 transition-all hover:scale-105 active:scale-95 text-[10px] sm:text-xs font-black uppercase cursor-pointer whitespace-nowrap"
                    title="Highlight next valid move"
                  >
                    <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400/30 text-amber-300" />
                    <span>Hint</span>
                  </button>

                  {/* Add Extra Tube Booster Button */}
                  <button
                    onClick={handleAddBottle}
                    disabled={extraBottleUsed}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border shadow-md transition-all text-[10px] sm:text-xs font-black uppercase whitespace-nowrap ${
                      !extraBottleUsed
                        ? 'bg-gradient-to-b from-emerald-500/15 to-green-600/20 hover:from-emerald-500/25 hover:to-green-600/30 text-emerald-300 border-emerald-500/40 shadow-emerald-950/20 hover:scale-105 active:scale-95 cursor-pointer'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
                    }`}
                    title={extraBottleUsed ? 'Extra tube already used for this stage' : 'Add an extra empty tube booster (+1 chance)'}
                  >
                    <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    <span>+1 Tube</span>
                  </button>

                  {/* Undo Button */}
                  <button
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border shadow-md transition-all text-[10px] sm:text-xs font-black uppercase whitespace-nowrap ${
                      history.length > 0
                        ? 'bg-gradient-to-b from-cyan-500/15 to-blue-600/20 hover:from-cyan-500/25 hover:to-blue-600/30 text-cyan-300 border-cyan-500/40 shadow-cyan-950/20 hover:scale-105 active:scale-95 cursor-pointer'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
                    }`}
                  >
                    <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Undo</span>
                    {history.length > 0 && (
                      <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-cyan-600 text-white text-[9px] sm:text-[10px] flex items-center justify-center font-bold">
                        {history.length}
                      </span>
                    )}
                  </button>

                  {/* Restart Button */}
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-b from-orange-500/15 to-amber-600/20 hover:from-orange-500/25 hover:to-amber-600/30 text-orange-300 border border-orange-500/40 shadow-md shadow-orange-950/20 transition-all hover:scale-105 active:scale-95 text-[10px] sm:text-xs font-black uppercase cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Restart</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <PauseModal
          isOpen={isPaused}
          onClose={() => setIsPaused(false)}
          onRestart={() => {
            setIsPaused(false);
            handleRestart();
          }}
          onHome={() => {
            setIsPaused(false);
            setScreen('home');
          }}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />

        <WinModal
          isOpen={isWinOpen}
          stage={stage}
          onNextStage={handleNextStage}
          onReplay={handleRestart}
        />

        <OutOfChancesModal
          isOpen={isOutOfChancesOpen}
          stage={stage}
          canUndo={history.length > 0}
          onRestart={handleRestart}
          onUndo={handleUndo}
          onHome={() => {
            setIsOutOfChancesOpen(false);
            setScreen('home');
          }}
        />

        <LevelsModal
          isOpen={isLevelsOpen}
          onClose={() => setIsLevelsOpen(false)}
          currentStage={stage}
          highestUnlocked={highestUnlocked}
          onSelectStage={(lvl) => {
            loadStage(lvl);
            setScreen('game');
          }}
        />

        <AchievementsModal
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
          totalStars={stars}
          currentStage={stage}
        />

        <HowToPlayModal
          isOpen={isHowToPlayOpen}
          onClose={() => setIsHowToPlayOpen(false)}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          musicEnabled={musicEnabled}
          onToggleMusic={() => setMusicEnabled(!musicEnabled)}
          vibrationEnabled={vibrationEnabled}
          onToggleVibration={() => setVibrationEnabled(!vibrationEnabled)}
          onResetProgress={handleResetProgress}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <ShopModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          coins={coins}
          activeTheme={activeTheme}
          unlockedThemes={unlockedThemes}
          onEquipTheme={handleEquipTheme}
          onPurchaseTheme={handlePurchaseTheme}
          activeSkin={activeSkin}
          unlockedSkins={unlockedSkins}
          onEquipSkin={handleEquipSkin}
          onPurchaseSkin={handlePurchaseSkin}
        />
      </div>
    </div>
  );
}
