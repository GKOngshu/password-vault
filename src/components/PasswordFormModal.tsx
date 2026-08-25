import React, { useState, useEffect } from 'react';
import { PasswordEntry } from '../types';
import { EyeIcon, EyeOffIcon, CopyIcon, LockIcon, TrashIcon, EditIcon } from './icons';

interface EntryDetailProps {
  entry: PasswordEntry | null;
  onSave: (entry: Omit<PasswordEntry, 'password'> & { password?: string }) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  isNew: boolean;
}

const EntryDetail: React.FC<EntryDetailProps> = ({ entry, onSave, onDelete, onCancel, isNew }) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [formData, setFormData] = useState<Partial<PasswordEntry>>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    setIsEditing(isNew);
    setFormData(isNew ? { name: '', website: '', username: '', email: '', password: '', notes: '' } : entry || {});
    setIsPasswordVisible(false);
  }, [entry, isNew]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: formData.id || new Date().toISOString(),
      name: formData.name || '',
      website: formData.website || '',
      username: formData.username || '',
      email: formData.email,
      password: formData.password,
      notes: formData.notes,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (isNew) {
      onCancel();
    } else {
      setIsEditing(false);
      setFormData(entry || {});
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let newPassword = '';
    for (let i = 0; i < 16; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const handleCopy = (text?: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };
  
  if (!entry && !isNew) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8">
        <LockIcon className="w-24 h-24 mb-4 text-slate-600" />
        <h2 className="text-2xl font-semibold text-slate-300">Welcome to your Vault</h2>
        <p className="mt-2 max-w-sm">Select an entry from the sidebar to view its details, or click 'Add New Password' to get started.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8">
      <div className="max-w-2xl mx-auto h-full">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex items-start justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">{isNew ? 'Create New Entry' : (isEditing ? `Editing ${entry?.name}`: entry?.name)}</h2>
                {!isEditing && entry && (
                    <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                        <button type="button" onClick={() => onDelete(entry.id)} className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-700 transition-colors" title="Delete"><TrashIcon className="w-5 h-5" /></button>
                        <button type="button" onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Edit"><EditIcon className="w-4 h-4" /><span>Edit</span></button>
                    </div>
                )}
            </div>

            <div className="space-y-4 flex-grow">
              {/* Name & Website */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300">Name</label>
                  <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-800 disabled:text-slate-400" required disabled={!isEditing} />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-slate-300">Website URL</label>
                  <input type="text" id="website" name="website" value={formData.website || ''} onChange={handleInputChange} placeholder="https://example.com" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-800 disabled:text-slate-400" required disabled={!isEditing} />
                </div>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-300">Username</label>
                  <input type="text" id="username" name="username" value={formData.username || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-800 disabled:text-slate-400" required disabled={!isEditing} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email <span className="text-slate-500">(Optional)</span></label>
                  <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-800 disabled:text-slate-400" disabled={!isEditing} />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
                <div className="relative mt-1">
                    <input 
                      type={isPasswordVisible ? 'text' : 'password'} 
                      id="password" 
                      name="password" 
                      value={formData.password || ''} 
                      onChange={handleInputChange} 
                      className={`block w-full bg-slate-700 border border-slate-600 rounded-md py-2 pl-3 ${isEditing ? 'pr-10' : 'pr-16'} text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-800 disabled:text-slate-400`}
                      required 
                      disabled={!isEditing} 
                    />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {!isEditing && (
                           <button type="button" onClick={() => handleCopy(formData.password)} className="text-slate-400 hover:text-white mr-2" title="Copy password">
                               <CopyIcon className="w-5 h-5" />
                           </button>
                        )}
                        <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="text-slate-400 hover:text-white">
                            {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                {isEditing && (
                    <div className="mt-2">
                        <button
                            type="button"
                            onClick={generatePassword}
                            className="flex items-center px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-slate-700 rounded-md hover:bg-slate-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <span>Generate Password</span>
                        </button>
                    </div>
                )}
              </div>

              {/* Notes Field */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-300">Notes <span className="text-slate-500">(Optional)</span></label>
                <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleInputChange} rows={5} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-800 disabled:text-slate-400" disabled={!isEditing}></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 mt-auto">
              {isEditing ? (
                <>
                  <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500">Save</button>
                </>
              ) : (
                entry && (
                  <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500">
                    Close
                  </button>
                )
              )}
            </div>
        </form>
      </div>
    </div>
  );
};

export default EntryDetail;