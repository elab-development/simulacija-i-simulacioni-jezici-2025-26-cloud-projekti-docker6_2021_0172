"use client";

import { useEffect, useState } from "react";
import AdminCategories from "./AdminCategories";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  // Tabovi: 'users' ili 'categories'
  const [activeTab, setActiveTab] = useState<'users' | 'categories'>('users');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Greška pri dohvatanju korisnika:", error);
    }
  };

  const toggleBlockUser = async (userId: number, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/users/block", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBlocked: !currentStatus }),
      });

      if (res.ok) {
        // azuriramo lokalno stanje da ne moramo da refresujemo sve
        setUsers(users.map(u => 
            u.id === userId ? { ...u, isBlocked: !currentStatus } : u
        ));
      }
    } catch (error) {
      console.error("Greška pri blokiranju:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* UKLONJEN HEADER/NAVBAR ODAVDE - KORISTIMO GLAVNI */}
        
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-6">
           <div>
               <h1 className="text-3xl font-bold text-white">Admin Panel 🛡️</h1>
               <p className="text-gray-400 mt-2">Upravljanje korisnicima i sadržajem aplikacije.</p>
           </div>
           
           {/* TABS ZA PREBACIVANJE */}
           <div className="flex bg-gray-800 p-1 rounded-xl mt-4 md:mt-0">
               <button 
                 onClick={() => setActiveTab('users')}
                 className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'users' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                 }`}
               >
                 Korisnici
               </button>
               <button 
                 onClick={() => setActiveTab('categories')}
                 className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'categories' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                 }`}
               >
                 Kategorije
               </button>
           </div>
        </div>

        {/* SADRZAJ TABOVA */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
            
            {/* KORISNICI */}
            {activeTab === 'users' && (
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Lista registrovanih korisnika</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-gray-900/50 text-xs uppercase text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Ime</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Uloga</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Akcija</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-700/30 transition">
                                        <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.isBlocked ? (
                                                <span className="text-red-400 flex items-center gap-1">🚫 Blokiran</span>
                                            ) : (
                                                <span className="text-green-400 flex items-center gap-1">✅ Aktivan</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role !== 'ADMIN' && (
                                                <button 
                                                    onClick={() => toggleBlockUser(u.id, u.isBlocked)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                                        u.isBlocked 
                                                        ? 'bg-green-600 hover:bg-green-500 text-white' 
                                                        : 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20'
                                                    }`}
                                                >
                                                    {u.isBlocked ? "Odblokiraj" : "Blokiraj pristup"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* KATEGORIJE */}
            {activeTab === 'categories' && (
                <div className="p-6">
                    <AdminCategories />
                </div>
            )}

        </div>
      </div>
    </div>
  );
}