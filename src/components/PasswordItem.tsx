import React, { useState } from 'react';
import { PasswordEntry } from '../types';
import { EyeIcon, EyeOffIcon, CopyIcon } from './icons';

interface PasswordItemProps {
  entry: PasswordEntry;
  isSelected: boolean;
  onSelect: (entry: PasswordEntry) => void;
}

const PasswordItem: React.FC<PasswordItemProps> = ({ entry, isSelected, onSelect }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when copying
    navigator.clipboard.writeText(entry.password || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  const baseClasses = "w-full text-left p-4 rounded-lg flex items-center justify-between transition-colors cursor-pointer";
  const selectedClasses = "bg-cyan-800/50";
  const unselectedClasses = "bg-slate-800 hover:bg-slate-700/50";

  return (
    <li>
      <button onClick={() => onSelect(entry)} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{entry.name}</p>
          <p className="text-sm text-slate-400 truncate">{entry.website}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
            <span className={`text-sm ${copied ? 'text-cyan-400' : 'text-transparent'} transition-colors`}>Copied!</span>
            <div className="p-2 text-slate-400 hover:text-cyan-400 rounded-full hover:bg-slate-700 transition-colors"
                title={copied ? 'Copied!' : 'Copy password'}
                onClick={handleCopy}>
                <CopyIcon className="w-5 h-5" />
            </div>
            <div className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
                title="Toggle password visibility"
                onClick={toggleVisibility}>
                {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </div>
        </div>
      </button>
      {isPasswordVisible && (
        <div className="px-4 pb-2 -mt-2 bg-slate-800 rounded-b-lg">
            <input
                type="text"
                value={entry.password}
                readOnly
                className="text-sm bg-transparent text-slate-300 w-full outline-none"
                aria-label="Visible Password"
            />
        </div>
      )}
    </li>
  );
};

export default PasswordItem;
