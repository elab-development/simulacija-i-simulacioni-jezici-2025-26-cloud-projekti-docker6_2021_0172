"use client";

import { useEffect, useState } from "react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);

  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // ucitavanje korisnika, budzeta i kategorija
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      window.location.href = "/login";
      return;
    }
    const userData = JSON.parse(userJson);
    setUser(userData);
    fetchData(userData.id);
  }, []);

  const fetchData = async (userId: number) => {
    try {
      const resBudgets = await fetch(`/api/budgets?userId=${userId}`);
      const budgetsData = await resBudgets.json();
      
      const resCats = await fetch(`/api/categories?userId=${userId}`); 
      if(resCats.ok) {
          const catsData = await resCats.json();
          setCategories(catsData);
      }
      
      if (Array.isArray(budgetsData)) {
        setBudgets(budgetsData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // kreiranje budzeta
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          categoryId: selectedCategory || null,
          userId: user.id
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setAmount("");
        setSelectedCategory("");
        fetchData(user.id);
      } else {
        const err = await res.json();
        alert(err.error || "Greška");
      }
    } catch (error) {
      alert("Greška na serveru");
    }
  };

  // iniciranje brisanja
  const openDeleteModal = (id: number) => {
    setBudgetToDelete(id);
  };

  // potvrda za brisanje
  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    
    try {
        const res = await fetch(`/api/budgets/${budgetToDelete}`, { 
            method: "DELETE" 
        });

        if (res.ok) {
            fetchData(user.id);
            setBudgetToDelete(null);
        } else {
            const errorData = await res.json();
            alert(`Greška: ${errorData.error || "Nepoznata greška"}`);
        }
    } catch (error) {
        console.error("Mrežna greška:", error);
        alert("Došlo je do greške u komunikaciji sa serverom.");
    }
  };

  // Helper za boju progress bara
  const getProgressColor = (percent: number) => {
    if (percent < 50) return "bg-green-500";
    if (percent < 85) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) return <div className="p-10 text-white text-center">Učitavanje budžeta...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mesečni Budžeti 📉</h1>
            <p className="text-gray-400">Pratite vaše limite potrošnje za ovaj mesec.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2"
          >
            + Novi Limit
          </button>
        </div>

        {/* grid kartica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.length === 0 ? (
            <div className="col-span-2 text-center py-10 bg-gray-800 rounded-2xl border border-gray-700 border-dashed">
                <p className="text-gray-400">Još niste postavili nijedan limit.</p>
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl relative overflow-hidden group">
                
                {/* header kartica */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {budget.category ? budget.category.name : "💰 UKUPAN BUDŽET"}
                        </h3>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Mesečni Limit</p>
                    </div>
                    {/* dugme za brisanje */}
                    <button 
                        onClick={() => openDeleteModal(budget.id)}
                        className="text-gray-500 hover:text-red-400 transition bg-transparent border-0 cursor-pointer"
                    >
                        🗑️
                    </button>
                </div>

                {/* iznosi */}
                <div className="flex justify-between items-end mb-2 relative z-10">
                    <div>
                        <span className="text-sm text-gray-400">Potrošeno:</span>
                        <div className="text-2xl font-bold text-white">{budget.spent.toLocaleString()} RSD</div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-gray-400">Limit:</span>
                        <div className="text-lg font-medium text-gray-300">{Number(budget.amount).toLocaleString()}</div>
                    </div>
                </div>

                {/* progress bar */}
                <div className="relative z-10">
                    <div className="flex justify-between text-xs mb-1">
                        <span className={budget.percentage > 100 ? "text-red-400 font-bold" : "text-gray-400"}>
                            {budget.percentage.toFixed(1)}%
                        </span>
                        <span className="text-gray-400">
                            Preostalo: <span className="text-white font-bold">{budget.remaining.toLocaleString()} RSD</span>
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Dekoracija u pozadini */}
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-xl ${getProgressColor(budget.percentage)}`}></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL ZA KREIRANJE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-3xl w-full max-w-md border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Postavi novi limit</h2>
            <form onSubmit={handleCreate} className="space-y-4">
                
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Kategorija</label>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">-- Ukupan Mesečni Budžet --</option>
                        {categories
                            .filter(cat => cat.type === "EXPENSE")
                            .map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Ostavite prazno ako želite limit za SVE troškove.</p>
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-2">Maksimalni Iznos (RSD)</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="npr. 20000"
                        required
                    />
                </div>

                <div className="flex gap-4 mt-8">
                    <button 
                        type="button" 
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
                    >
                        Otkaži
                    </button>
                    <button 
                        type="submit" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg"
                    >
                        Sačuvaj
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ZA BRISANJE */}
      {budgetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
           <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  🗑️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Brisanje limita</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Da li ste sigurni da želite da obrišete ovaj budžet? Ova akcija se ne može poništiti.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setBudgetToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition"
                >
                  Odustani
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 transition"
                >
                  Obriši
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}