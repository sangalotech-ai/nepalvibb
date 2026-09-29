"use client";

import { useState, useEffect } from 'react';
import { 
  User as UserIcon, Mail, Calendar, 
  Trash2, Search, Filter, ShieldCheck,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This will also remove their session and profile data.')) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Traveler Community</h1>
          <p className="text-gray-400 font-medium">Manage your registered users and their profiles</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-2 border-gray-50 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium w-full md:w-80 focus:outline-none focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Registered</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-20 text-center text-gray-400 font-medium">No users found.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center overflow-hidden border border-primary/10">
                        {user.image ? (
                          <img src={user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary uppercase tracking-tight">{user.name || 'Anonymous'}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Mail className="w-3 h-3 mr-1.5" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="inline-flex items-center px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <UserCheck className="w-3 h-3 mr-2" />
                      Active
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center text-xs text-gray-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 mr-2" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => deleteUser(user._id)}
                      className="p-3 bg-red-50 text-red-600 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
