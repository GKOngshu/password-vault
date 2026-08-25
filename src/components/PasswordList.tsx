import React from 'react';
import { PasswordEntry } from '../types';
import PasswordItem from './PasswordItem';
import { LockIcon } from './icons';

interface PasswordListProps {
  passwords: PasswordEntry[];
  selectedEntryId: string | null;
  onSelect: (entry: PasswordEntry) => void;
}

const PasswordList: React.FC<PasswordListProps> = ({ passwords, selectedEntryId, onSelect }) => {
  if (passwords.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <LockIcon className="mx-auto h-10 w-10 text-slate-500" />
        <h3 className="mt-2 text-base font-medium text-white">No passwords found</h3>
        <p className="mt-1 text-xs text-slate-400">Add a new password to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {passwords.map((entry) => (
        <PasswordItem 
            key={entry.id} 
            entry={entry}
            isSelected={entry.id === selectedEntryId}
            onSelect={onSelect}
        />
      ))}
    </ul>
  );
};

export default PasswordList;