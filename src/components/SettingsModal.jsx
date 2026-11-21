import React from 'react';
import { Volume2, VolumeX, Music, Smartphone, RotateCcw, X, ShieldAlert, LogOut, User } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export default function SettingsModal({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
  vibrationEnabled,
  onToggleVibration,
  onResetProgress,
  currentUser,
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm bg-slate-900/95 rounded-3xl p-6 border-2 border-white/20 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-xl font-black text-white">Settings</h2>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3">
          {/* Sound */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-white/5">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-sm font-extrabold text-white">Sound Effects</h4>
                <p className="text-[11px] text-slate-400">Pouring, bubbles, chimes</p>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Music */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-white/5">
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-sm font-extrabold text-white">Music</h4>
                <p className="text-[11px] text-slate-400">Background cozy winter ambient</p>
              </div>
            </div>
            <button
              onClick={onToggleMusic}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                musicEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Haptics */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-white/5">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-extrabold text-white">Vibration</h4>
                <p className="text-[11px] text-slate-400">Haptic feedback on tap</p>
              </div>
            </div>
            <button
              onClick={onToggleVibration}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                vibrationEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Account Info & Logout */}
        {currentUser && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Signed in as:</span>
              </span>
              <span className="font-black text-white">{currentUser.username}</span>
            </div>

            {onLogout && (
              <button
                onClick={() => {
                  gameAudio.playClick();
                  if (window.confirm(`Log out of account "${currentUser.username}"?`)) {
                    onClose();
                    onLogout();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        )}

        {/* Reset Game Button */}
        <button
          onClick={() => {
            gameAudio.playClick();
            if (window.confirm('Reset all progress back to Stage 1?')) {
              onResetProgress();
              onClose();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Progress to Stage 1</span>
        </button>
      </div>
    </div>
  );
}

