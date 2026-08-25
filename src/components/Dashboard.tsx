import React, { useState, useMemo, useCallback } from 'react';
import Sidebar from './Sidebar';
import EntryDetail from './PasswordFormModal'; // Re-purposed component
import ChangeMasterPasswordModal from './ChangeMasterPasswordModal';
import { PasswordEntry } from '../types';
import { useEncryptedLocalStorage } from '../hooks/useLocalStorage';

interface DashboardProps {
  masterPassword: string;
  onLock: () => void;
  onDeleteVault: () => void;
  onChangeMasterPassword: (oldPassword: string, newPassword: string) => Promise<{success: boolean; message?: string}>;
}

const Dashboard: React.FC<DashboardProps> = ({ masterPassword, onLock, onDeleteVault, onChangeMasterPassword }) => {
  const [passwords, setPasswords, isLoading] = useEncryptedLocalStorage<PasswordEntry[]>('password-data', [], masterPassword);
  const [searchQuery, setSearchQuery] = useState('');
  // `selectedEntryId` can be an ID, 'new' for the creation form, or `null` for the welcome screen.
  const [selectedEntryId, setSelectedEntryId] = useState<string | null | 'new'>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleSavePassword = (entry: Omit<PasswordEntry, 'password'> & { password?: string }) => {
    const isEditing = passwords.some(p => p.id === entry.id);
    let newPasswords;
    if (isEditing) {
      newPasswords = passwords.map(p => p.id === entry.id ? (entry as PasswordEntry) : p);
    } else {
      newPasswords = [...passwords, entry as PasswordEntry];
    }
    setPasswords(newPasswords);
    // After saving, select the entry that was just saved/created
    setSelectedEntryId(entry.id); 
  };
  
  const handleAddNew = () => {
    setSelectedEntryId('new');
  };

  const handleSelectEntry = (entry: PasswordEntry) => {
    setSelectedEntryId(entry.id);
  };

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setPasswords(prevPasswords => prevPasswords.filter(p => p.id !== id));
      // If the deleted entry was the selected one, clear the selection
      if (selectedEntryId === id) {
        setSelectedEntryId(null);
      }
    }
  }, [selectedEntryId, setPasswords]);
  
  const filteredPasswords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return passwords;

    return passwords.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.website.toLowerCase().includes(query) || 
      p.username.toLowerCase().includes(query) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.notes && p.notes.toLowerCase().includes(query))
    );
  }, [passwords, searchQuery]);

  const selectedEntry = useMemo(() => {
      if (!selectedEntryId || selectedEntryId === 'new') return null;
      return passwords.find(p => p.id === selectedEntryId) || null;
  }, [passwords, selectedEntryId]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white font-sans">
        <div className="animate-pulse">Decrypting Vault...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans">
      <Sidebar 
        passwords={filteredPasswords}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddNew={handleAddNew}
        onLock={onLock}
        onDeleteVault={onDeleteVault}
        onSelectEntry={handleSelectEntry}
        selectedEntryId={selectedEntryId}
        onChangeMasterPasswordClick={() => setIsChangePasswordModalOpen(true)}
      />
      <main className="flex-1 bg-slate-800/50 overflow-y-auto">
        <EntryDetail
          entry={selectedEntry}
          onSave={handleSavePassword}
          onDelete={handleDelete}
          onCancel={() => setSelectedEntryId(null)}
          isNew={selectedEntryId === 'new'}
        />
      </main>
      <ChangeMasterPasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={onChangeMasterPassword}
      />
    </div>
  );
};

export default Dashboard;