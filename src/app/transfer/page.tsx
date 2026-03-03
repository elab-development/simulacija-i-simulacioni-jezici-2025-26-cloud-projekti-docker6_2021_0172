"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function TransferPage() {
  const router = useRouter();
  
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Podaci forme
  const [fromWallet, setFromWallet] = useState("");
  const [toWallet, setToWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchWallets = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }
      const user = JSON.parse(storedUser);

      try {
        const res = await fetch(`/api/wallets?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setWallets(data);
          // Postavi default vrednosti
          if (data.length >= 2) {
            setFromWallet(data[0].id);
            setToWallet(data[1].id);
          } else if (data.length === 1) {
            setFromWallet(data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (fromWallet === toWallet) {
        setError("Izvorni i ciljni novčanik moraju biti različiti.");
        return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWalletId: fromWallet,
          toWalletId: toWallet,
          amount,
          description,
          date,
          userId: user.id
        }),
      });

      if (res.ok) {
        router.push("/wallets");
      } else {
        const errData = await res.json();
        setError(errData.error);
      }
    } catch (error) {
      setError("Greška prilikom prenosa.");
    }
  };

  if (loading) return <div className="p-10 text-center text-white">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex justify-center items-start pt-12">
      <div className="w-full max-w-lg bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
           🔄 Interni Prenos
        </h1>

        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">
                {error}
            </div>
        )}

        {wallets.length < 2 ? (
             <div className="text-gray-300 text-center py-4">
                Potrebna su bar dva novčanika za prenos. 
                <br/>
                <Button onClick={() => router.push("/wallets")} className="mt-4">Napravi novi novčanik</Button>
             </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* IZVORISTE */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Sa novčanika (Šalje)</label>
                <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500"
                    value={fromWallet}
                    onChange={(e) => setFromWallet(e.target.value)}
                >
                    {wallets.map(w => (
                        <option key={w.id} value={w.id}>
                            {w.name} (Stanje: {w.balance} {w.currency})
                        </option>
                    ))}
                </select>
            </div>

            {/* ODREDISTE */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Na novčanik (Prima)</label>
                <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500"
                    value={toWallet}
                    onChange={(e) => setToWallet(e.target.value)}
                >
                    {wallets.map(w => (
                        <option key={w.id} value={w.id} disabled={w.id == fromWallet}>
                            {w.name} {w.id == fromWallet ? "(Izvor)" : ""}
                        </option>
                    ))}
                </select>
            </div>

            <Input 
                label="Iznos za prenos" 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
            />

            <Input 
                label="Opis (Opciono)" 
                placeholder="npr. Štednja za more" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <div>
                 <label className="block text-sm font-medium text-gray-400 mb-2">Datum</label>
                 <input 
                   type="date" 
                   className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white"
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                 />
            </div>

            <div className="pt-4 border-t border-gray-700">
                <Button type="submit">Izvrši Prenos ➡️</Button>
                <button 
                type="button"
                onClick={() => router.back()}
                className="w-full mt-4 text-gray-500 hover:text-gray-300 text-sm"
                >
                Odustani
                </button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
}