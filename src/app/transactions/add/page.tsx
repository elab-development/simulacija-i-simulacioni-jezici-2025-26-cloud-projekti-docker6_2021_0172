"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AddTransactionPage() {
  const router = useRouter();
  
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Podaci forme
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("EXPENSE"); 
  const [selectedWallet, setSelectedWallet] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(storedUser);

    const fetchData = async () => {
      try {
        const [resWallets, resCategories] = await Promise.all([
          fetch(`/api/wallets?userId=${user.id}`),
          fetch("/api/categories")
        ]);

        if (resWallets.ok) {
          const wData = await resWallets.json();
          setWallets(wData);
          if (wData.length > 0) setSelectedWallet(wData[0].id);
        }

        if (resCategories.ok) {
          const cData = await resCategories.json();
          setCategories(cData);
        }
      } catch (error) {
        console.error("Greška:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(c => c.type === type);
    if (filtered.length > 0) {
      setSelectedCategory(filtered[0].id);
    }
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || !selectedCategory) return;

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description,
          type,
          date,
          walletId: selectedWallet,
          categoryId: selectedCategory
        }),
      });

      if (res.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400 font-medium">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-lg bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700 h-fit">
        
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-600/30">
                💸
            </div>
            <h1 className="text-2xl font-bold text-white">Nova Transakcija</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Tasteri za tip transakcije */}
          <div className="flex gap-3 bg-gray-900/50 p-1.5 rounded-2xl border border-gray-700">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-200 ${
                type === "EXPENSE" 
                  ? "bg-red-600 text-white shadow-lg" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Trošak
            </button>
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-200 ${
                type === "INCOME" 
                  ? "bg-green-600 text-white shadow-lg" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Prihod
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <Input 
              label="Iznos" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              placeholder="0.00"
            />

            <Input 
              label="Opis" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Na šta ste potrošili?"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Novčanik</label>
                    <select 
                        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        value={selectedWallet}
                        onChange={(e) => setSelectedWallet(e.target.value)}
                    >
                        {wallets.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Kategorija</label>
                    <select 
                        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.filter(c => c.type === type).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Datum</label>
                 <input 
                   type="date" 
                   className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                 />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <Button type="submit">Sačuvaj transakciju</Button>
            <button 
              type="button"
              onClick={() => router.push("/")}
              className="w-full mt-4 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
            >
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}