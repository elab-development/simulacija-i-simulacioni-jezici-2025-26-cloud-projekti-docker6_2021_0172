"use client";

import { useState } from "react";

// Definišemo interfejs za Props (šta komponenta prima od roditelja)
interface TransactionHistoryProps {
  transactions: any[];
  onRefresh: () => void;
}

export default function TransactionHistory({ transactions, onRefresh }: TransactionHistoryProps) {
  // State za loading brisanja (opciono)
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // filteri
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); 
  const [filterCategory, setFilterCategory] = useState("ALL");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.wallet?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || tx.type === filterType;
    const categoryName = tx.category?.name || "Ostalo";
    const matchesCategory = filterCategory === "ALL" || categoryName === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Izvuci kategorije za filter dropdown
  const availableCategories = Array.from(new Set(transactions.map(t => t.category?.name || "Ostalo")));

  const handleDelete = async (id: number, type: string) => {
    if (type === 'TRANSFER') {
        alert("Transferi se ne mogu brisati jer utiču na dva novčanika. Napravite kontra-transakciju.");
        return;
    }

    setDeletingId(id);

    try {
        const res = await fetch(`/api/transactions/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            // zovemo funkciju iz page.tsx da osvezi podatke
            onRefresh();
        } else {
            const errorData = await res.json();
            alert("Greška: " + (errorData.error || "Nepoznata greška"));
        }
    } catch (error) {
        console.error("Greška pri brisanju:", error);
        alert("Došlo je do greške na serveru.");
    } finally {
        setDeletingId(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      
      <div className="p-5 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-white">Istorija Transakcija</h3>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {/* PRETRAGA */}
                <input 
                    type="text" 
                    placeholder="🔍 Pretraži..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />

                {/* FILTER PO TIPU */}
                <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg p-2 outline-none"
                >
                    <option value="ALL">Svi Tipovi</option>
                    <option value="INCOME">Prihodi (+)</option>
                    <option value="EXPENSE">Troškovi (-)</option>
                    <option value="TRANSFER">Transferi</option>
                </select>

                {/* FILTER PO KATEGORIJI */}
                <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg p-2 outline-none"
                >
                    <option value="ALL">Sve Kategorije</option>
                    {availableCategories.map(cat => (
                        <option key={cat as string} value={cat as string}>{cat as string}</option>
                    ))}
                </select>

                {/* DUGME ZA RESET */}
                {(searchTerm || filterType !== "ALL" || filterCategory !== "ALL") && (
                    <button 
                        onClick={() => { setSearchTerm(""); setFilterType("ALL"); setFilterCategory("ALL"); }}
                        className="text-red-400 text-xs hover:text-white transition"
                    >
                        ✖ Poništi
                    </button>
                )}
            </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Opis</th>
              <th className="px-6 py-3">Kategorija</th>
              <th className="px-6 py-3">Novčanik</th>
              <th className="px-6 py-3">Datum</th>
              <th className="px-6 py-3 text-right">Iznos</th>
              <th className="px-6 py-3 text-center">Akcija</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-700/50 transition duration-150">
                    <td className="px-6 py-4 font-medium text-white">
                    {tx.description || "Bez opisa"}
                    </td>
                    <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-xs text-gray-300">
                        {tx.category?.name || "Ostalo"}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{tx.wallet?.name}</td>
                    <td className="px-6 py-4 text-gray-400">
                    {new Date(tx.date).toLocaleDateString("sr-RS")}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${
                    tx.type === "INCOME" 
                        ? "text-emerald-400" 
                        : tx.type === "TRANSFER" 
                            ? "text-blue-400" 
                            : "text-rose-400"
                    }`}>
                    {tx.type === "INCOME" ? "+" : "-"}{tx.amount} RSD
                    </td>
                    <td className="px-6 py-4 text-center">
                        {tx.type !== "TRANSFER" ? (
                            <button 
                                onClick={() => handleDelete(tx.id, tx.type)}
                                disabled={deletingId === tx.id}
                                className="text-gray-500 hover:text-red-500 transition p-2 hover:bg-red-500/10 rounded-full"
                                title="Obriši"
                            >
                                {deletingId === tx.id ? "..." : "🗑️"}
                            </button>
                        ) : (
                            <span className="text-gray-600 cursor-not-allowed" title="Transfer se ne briše">🔒</span>
                        )}
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                        Nema transakcija za zadate filtere. 🔍
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}