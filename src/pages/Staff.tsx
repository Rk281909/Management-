import React, { useState } from 'react';
import { useDatabase, Staff as StaffType } from '../store/MockDatabaseContext';
import { Search, Plus, Shield, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Staff() {
  const { staff, addStaff, updateStaff } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (staffMember?: StaffType) => {
    if (staffMember) {
      setEditingStaff(staffMember);
    } else {
      setEditingStaff(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const staffData = {
      name: formData.get('name') as string,
      role: formData.get('role') as 'Admin' | 'Manager' | 'Staff',
      status: formData.get('status') as 'active' | 'inactive',
    };

    if (editingStaff) {
      updateStaff(editingStaff.id, staffData);
    } else {
      addStaff(staffData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Staff Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-xl flex items-center">
        <Search className="h-5 w-5 text-slate-400 mr-3" />
        <input 
          type="text" 
          placeholder="Search staff by name or ID..." 
          className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredStaff.map(member => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={member.id} 
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold border ${
                    member.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                    member.role === 'Manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-slate-400">ID: {member.id}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {member.status}
                </span>
              </div>
              
              <div className="flex items-center mb-6 relative z-10">
                <Shield className="h-4 w-4 text-slate-500 mr-2" />
                <span className="text-sm text-slate-300 font-medium">{member.role}</span>
              </div>

              <div className="flex justify-end space-x-2 border-t border-white/5 pt-4 relative z-10">
                <button 
                  onClick={() => handleOpenModal(member)}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </button>
                <button 
                  onClick={() => updateStaff(member.id, { status: member.status === 'active' ? 'inactive' : 'active' })}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> {member.status === 'active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredStaff.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 glass-panel rounded-2xl">
            No staff members found matching your search.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel rounded-2xl w-full max-w-md p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500" />
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white">{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <input 
                    name="name" 
                    defaultValue={editingStaff?.name}
                    required 
                    type="text" 
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                  <select 
                    name="role" 
                    defaultValue={editingStaff?.role || 'Staff'}
                    required 
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all [&>option]:bg-slate-900"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingStaff?.status || 'active'}
                    required 
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all [&>option]:bg-slate-900"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    {editingStaff ? 'Save Changes' : 'Add Staff'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
