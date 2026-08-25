import React from 'react';
import { PlusIcon, SearchIcon, LogoutIcon, LockIcon, TrashIcon, CogIcon } from './icons';
import { PasswordEntry } from '../types';
import PasswordList from './PasswordList';

interface SidebarProps {
  passwords: PasswordEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddNew: () => void;
  onLock: () => void;
  onDeleteVault: () => void;
  onSelectEntry: (entry: PasswordEntry) => void;
  selectedEntryId: string | null;
  onChangeMasterPasswordClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ passwords, searchQuery, setSearchQuery, onAddNew, onLock, onDeleteVault, onSelectEntry, selectedEntryId, onChangeMasterPasswordClick }) => {
  return (
    <aside className="w-80 bg-slate-900/70 p-4 flex flex-col backdrop-blur-sm border-r border-slate-800 h-screen">
      <div className="flex items-center space-x-3 mb-4 p-2">
        <LockIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">Password Vault</h1>
      </div>

      <div className="px-1">
        <div className="relative mb-2">
            <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
        </div>

        <button
            onClick={onAddNew}
            className="w-full flex items-center justify-center space-x-2 bg-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-cyan-700 transition-colors mb-4"
        >
            <PlusIcon className="w-5 h-5" />
            <span>Add New Password</span>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-1">
        <PasswordList 
            passwords={passwords}
            selectedEntryId={selectedEntryId}
            onSelect={onSelectEntry}
        />
      </div>


      <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
        <button
          onClick={onChangeMasterPasswordClick}
          className="w-full flex items-center justify-center space-x-2 bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors"
        >
          <CogIcon className="w-5 h-5" />
          <span>Change Master Password</span>
        </button>
        <button
          onClick={onLock}
          className="w-full flex items-center justify-center space-x-2 bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors"
        >
          <LogoutIcon className="w-5 h-5" />
          <span>Lock Vault</span>
        </button>
        <button
          onClick={onDeleteVault}
          className="w-full flex items-center justify-center space-x-2 bg-red-900/50 text-red-400 font-semibold py-2 px-4 rounded-lg hover:bg-red-800/60 transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
          <span>Delete Vault</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;