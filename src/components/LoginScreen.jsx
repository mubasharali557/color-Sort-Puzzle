import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { authService } from '../utils/authService';
import { gameAudio } from '../utils/gameAudio';

export default function LoginScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    gameAudio.playClick();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Please enter a username.');
      return;
    }

    if (!cleanPass) {
      setError('Please enter a password.');
      return;
    }

    if (mode === 'register') {
      if (cleanPass !== confirmPassword.trim()) {
        setError('Passwords do not match. Please verify your password.');
        return;
      }
      if (cleanPass.length < 4) {
        setError('Password must be at least 4 characters long.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await authService.login(cleanUser, cleanPass);
        gameAudio.playSelect();
        onLoginSuccess(result.user, result.progress);
      } else {
        const result = await authService.register(cleanUser, cleanPass);
        gameAudio.playComplete();
        onLoginSuccess(result.user, result.progress);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      gameAudio.playClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black flex flex-col items-center justify-center p-4 select-none font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/winter-scene.jpg"
          alt="Water Sort Background"
          className="w-full h-full object-cover object-center filter brightness-50 contrast-125 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-indigo-950/80 to-slate-950/95" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-gradient-to-b from-cyan-500/20 via-indigo-600/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(2,6,23,0.9)_100%)]" />
      </div>

      {/* Floating Sparkles & Light Orbs */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-10 w-64 h-64 bg-[#ff0000]/15 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-16 right-10 w-64 h-64 bg-[#ffff00]/15 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute bottom-16 left-16 w-64 h-64 bg-[#00e626]/15 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Auth Card Container */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center">
        {/* Top Game Hero Emblem */}
        <div className="flex flex-col items-center mb-3 sm:mb-4 text-center">
          {/* Flasks Trio Graphic */}
          <div className="relative flex items-end justify-center gap-4 sm:gap-5 pb-1 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            {/* Left Flask */}
            <div className="relative w-6 h-16 sm:w-7 sm:h-20 transform -rotate-6 flex flex-col justify-end">
              <div className="absolute top-0 inset-x-[-1px] h-1.5 bg-white/40 rounded-full" />
              <div className="relative w-full h-[88%] rounded-b-md rounded-t-lg bg-white/10 backdrop-blur-md shadow-md flex flex-col justify-end overflow-hidden">
                <div className="w-full h-3 sm:h-3.5 bg-[#ffea00]" />
                <div className="w-full h-3 sm:h-3.5 bg-[#004cff]" />
                <div className="w-full h-3 sm:h-3.5 bg-[#00e626]" />
                <div className="w-full h-3.5 sm:h-4 rounded-b-sm bg-[#eb0000]" />
              </div>
            </div>

            {/* Center Flask */}
            <div className="relative w-7 h-18 sm:w-8.5 sm:h-22 z-10 flex flex-col justify-end">
              <div className="absolute top-0 inset-x-[-1px] h-2 bg-white/50 rounded-full shadow-sm" />
              <div className="relative w-full h-[88%] rounded-b-md rounded-t-lg bg-white/10 backdrop-blur-md shadow-lg flex flex-col justify-end overflow-hidden">
                <div className="w-full h-3.5 sm:h-4 bg-[#ff5ebc]" />
                <div className="w-full h-3.5 sm:h-4 bg-[#ffea00]" />
                <div className="w-full h-3.5 sm:h-4 bg-[#00e5ff]" />
                <div className="w-full h-4 sm:h-5 rounded-b-sm bg-[#9900ff]" />
              </div>
            </div>

            {/* Right Flask */}
            <div className="relative w-6 h-16 sm:w-7 sm:h-20 transform rotate-6 flex flex-col justify-end">
              <div className="absolute top-0 inset-x-[-1px] h-1.5 bg-white/40 rounded-full" />
              <div className="relative w-full h-[88%] rounded-b-md rounded-t-lg bg-white/10 backdrop-blur-md shadow-md flex flex-col justify-end overflow-hidden">
                <div className="w-full h-3 sm:h-3.5 bg-[#004cff]" />
                <div className="w-full h-3 sm:h-3.5 bg-[#ff7700]" />
                <div className="w-full h-3 sm:h-3.5 bg-[#ffffff]" />
                <div className="w-full h-3.5 sm:h-4 rounded-b-sm bg-[#141418]" />
              </div>
            </div>
          </div>

          {/* Logo Typography */}
          <div className="relative inline-block mt-0.5">
            <h1 className="text-2xl sm:text-4xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 drop-shadow-[0_2px_0_#78350f]">
              WATER
            </h1>
            <h2 className="text-xl sm:text-3xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-sky-400 to-blue-500 -mt-1 sm:-mt-1.5 drop-shadow-[0_2px_0_#0369a1]">
              SORT
            </h2>
            <div className="mx-auto -mt-1 px-3 py-0.2 rounded-full bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-indigo-500/60 shadow-sm inline-block">
              <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-white">
                PUZZLE
              </span>
            </div>
          </div>
        </div>

        {/* Main Obsidian Glass Login Box */}
        <div className="w-full bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-black/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 border border-indigo-500/40 shadow-[0_16px_48px_rgba(0,0,0,0.9),0_0_30px_rgba(99,102,241,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col gap-4">
          
          {/* Mode Switch Tabs: Sign In / Create Account */}
          <div className="w-full grid grid-cols-2 p-1 bg-slate-950/90 rounded-2xl border border-slate-800/80 shadow-inner">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-[0_2px_10px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-b from-emerald-600 to-teal-700 text-white shadow-[0_2px_10px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Title Header */}
          <div className="flex flex-col text-center">
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              {mode === 'login' ? 'Welcome Back!' : 'Join the Puzzle Journey'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {mode === 'login'
                ? 'Sign in to continue your saved stage and achievements'
                : 'Create an account to start fresh from Stage 1 with your own progress'}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="w-full flex items-start gap-2 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Username Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-300 ml-1">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. PuzzleMaster"
                  maxLength={18}
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm font-bold tracking-wide outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-300 ml-1">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm font-bold tracking-wide outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (in Register Mode) */}
            {mode === 'register' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-300 ml-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-white placeholder-slate-500 text-sm font-bold tracking-wide outline-none transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`relative w-full mt-2 py-3 sm:py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-lg active:scale-98 ${
                mode === 'login'
                  ? 'bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-700 hover:brightness-110 text-white border-2 border-cyan-300 shadow-[0_6px_20px_rgba(6,182,212,0.4)]'
                  : 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-700 hover:brightness-110 text-white border-2 border-emerald-300 shadow-[0_6px_20px_rgba(16,185,129,0.4)]'
              }`}
            >
              {/* Subtle top sheen */}
              <div className="absolute top-0.5 inset-x-6 h-1.5 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />
              
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                </div>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Log In to Play</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform text-amber-300" />
                  <span>Start Fresh at Stage 1</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security & Isolation Features Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-center text-slate-400 text-[10px] sm:text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Secure hashed passwords. Each player has their own separate game progress.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
