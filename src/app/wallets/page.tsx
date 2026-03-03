"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function WalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  
  // Podaci za novi novčanik
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  // State za detalje (Istorija)
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // --- NOVO: STATE ZA BRISANJE ---
  // Ovde čuvamo ID novčanika koji želimo da obrišemo. Ako je null, prozor je zatvoren.
  const [walletToDelete, setWalletToDelete] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(storedUser);
    setUserId(user.id);
    fetchWallets(user.id);
  }, []);

  const fetchWallets = async (id: number) => {
    try {
      const res = await fetch(`/api/wallets?userId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setWallets(data);
      }
    } catch (error) {
      console.error("Greška:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            name, 
            balance: parseFloat(balance) || 0, 
            currency: "RSD",
            userId: userId 
        }),
      });
      if (res.ok) {
        setName("");
        setBalance("");
        fetchWallets(userId);
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  // klik na kanticu (Samo otvara prozor)
  const initiateDelete = (e: React.MouseEvent, walletId: number) => {
    e.stopPropagation(); // sprecava da se otvori istorija transakcija
    setWalletToDelete(walletId); // otvara model za brisanje
  };

  // potvrda brisanja (zovemo api)
  const confirmDeleteAction = async () => {
    if (!walletToDelete) return;

    try {
      const res = await fetch(`/api/wallets?id=${walletToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (userId) fetchWallets(userId); // Osveži listu
        setWalletToDelete(null); // Zatvori modal
      } else {
        alert("Došlo je do greške prilikom brisanja.");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const openWalletDetails = async (wallet: any) => {
    setSelectedWallet(wallet);
    setLoadingTransactions(true);
    try {
        const res = await fetch(`/api/transactions?userId=${userId}`);
        if (res.ok) {
            const allTransactions = await res.json();
            const filtered = allTransactions.filter((t: any) => t.walletId === wallet.id);
            setWalletTransactions(filtered);
        }
    } catch (error) {
        console.error("Greška", error);
    } finally {
        setLoadingTransactions(false);
    }
  };

  const closeModal = () => {
    setSelectedWallet(null);
    setWalletTransactions([]);
  };

  const totalBalance = wallets.reduce((acc, curr) => acc + parseFloat(curr.balance), 0);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
                    Moji Novčanici
                </h1>
                <p className="text-gray-400 mt-2">Upravljajte svojim računima i kešom.</p>
            </div>
            
            <div className="mt-6 md:mt-0 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
                    💰
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Ukupno raspoloživo</p>
                    <p className="text-2xl font-bold text-white">{totalBalance.toLocaleString()} RSD</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* FORMA */}
            <div className="lg:col-span-1">
                <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700 sticky top-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-900/50">
                            ＋
                        </div>
                        <h2 className="text-xl font-bold text-white">Dodaj Novčanik</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input 
                            label="Naziv (npr. Keš, Banka)" 
                            placeholder="Unesite naziv..." 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                        <Input 
                            label="Početni Iznos (RSD)" 
                            type="number" 
                            placeholder="0" 
                            value={balance} 
                            onChange={(e) => setBalance(e.target.value)} 
                        />
                        <Button type="submit" className="w-full py-3 text-lg shadow-xl shadow-blue-900/20">
                            Kreiraj Račun
                        </Button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border border-blue-800/50">
                        <p className="text-xs text-blue-300 leading-relaxed">
                            💡 Kliknite na karticu novčanika da biste videli detaljnu istoriju transakcija samo za taj račun.
                        </p>
                    </div>
                </div>
            </div>

            {/* LISTA KARTICA */}
            <div className="lg:col-span-2">
                {wallets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-3xl text-gray-500">
                        <span className="text-4xl mb-4">💳</span>
                        <p>Nemate kreiranih novčanika.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {wallets.map((wallet, index) => (
                            <div 
                                key={wallet.id}
                                onClick={() => openWalletDetails(wallet)}
                                className={`relative overflow-hidden rounded-2xl p-6 h-52 flex flex-col justify-between shadow-2xl transition-all hover:-translate-y-1 hover:shadow-blue-900/20 group cursor-pointer
                                    ${index % 2 === 0 
                                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                                        : 'bg-gradient-to-br from-blue-900/40 to-gray-900 border border-blue-900/50'}
                                `}
                            >
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                                <div className="absolute bottom-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>

                                <div className="flex justify-between items-start z-10">
                                    <div>
                                        <div className="w-10 h-8 bg-gradient-to-r from-yellow-200 to-yellow-500 rounded-md mb-2 opacity-80 shadow-sm flex items-center justify-center">
                                            <div className="w-full h-px bg-black/10"></div>
                                        </div>
                                        <span className="text-xs text-gray-400 font-mono tracking-widest">SMART WALLET</span>
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => initiateDelete(e, wallet.id)} // 👈 OVDE POZIVAMO FUNKCIJU ZA OTVARANJE PROZORA
                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-black/20 rounded-full z-20"
                                        title="Obriši novčanik"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                <div className="z-10 mt-2">
                                    <p className="text-3xl font-bold text-white tracking-tight">
                                        {parseFloat(wallet.balance).toLocaleString()} 
                                        <span className="text-lg font-normal text-gray-400 ml-2">RSD</span>
                                    </p>
                                </div>

                                <div className="flex justify-between items-end z-10">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase mb-0.5">Naziv računa</p>
                                        <p className="text-sm font-semibold text-gray-200 tracking-wide uppercase">{wallet.name}</p>
                                    </div>
                                    <div className="flex -space-x-2 opacity-70">
                                        <div className="w-6 h-6 rounded-full bg-red-500/80"></div>
                                        <div className="w-6 h-6 rounded-full bg-yellow-500/80"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* istorija transakcija */}
        {selectedWallet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={closeModal}>
                <div 
                    className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                💳 {selectedWallet.name}
                            </h3>
                            <p className="text-sm text-gray-400">Istorija transakcija</p>
                        </div>
                        <button onClick={closeModal} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition">
                            ✕
                        </button>
                    </div>

                    <div className="p-0 overflow-y-auto">
                        {loadingTransactions ? (
                            <div className="p-10 text-center text-gray-400">Učitavanje transakcija...</div>
                        ) : walletTransactions.length === 0 ? (
                            <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                                <span className="text-3xl mb-2">📭</span>
                                Nema transakcija za ovaj novčanik.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="bg-gray-700/30 text-xs uppercase text-gray-400 sticky top-0 backdrop-blur-md">
                                    <tr>
                                        <th className="px-6 py-3">Opis</th>
                                        <th className="px-6 py-3">Datum</th>
                                        <th className="px-6 py-3">Kategorija</th>
                                        <th className="px-6 py-3 text-right">Iznos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {walletTransactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-700/20 transition">
                                            <td className="px-6 py-4 font-medium text-white">{t.description || "Bez opisa"}</td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {new Date(t.date).toLocaleDateString("sr-RS")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                                                    {t.category?.name || "N/A"}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${
                                                t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {t.type === 'INCOME' ? '+' : '-'} {parseFloat(t.amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    <div className="p-4 border-t border-gray-700 bg-gray-900/30 text-right">
                        <Button onClick={closeModal} className="px-6 py-2 text-sm">Zatvori</Button>
                    </div>
                </div>
            </div>
        )}

        {/* potvrsa brisanja */}
        {walletToDelete && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 animate-in fade-in zoom-in duration-200">
                    
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            🗑️
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Brisanje novčanika</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Da li ste sigurni? Ovom akcijom ćete trajno obrisati novčanik i <strong>sve njegove transakcije</strong>.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setWalletToDelete(null)}
                            className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition"
                        >
                            Odustani
                        </button>
                        <button 
                            onClick={confirmDeleteAction}
                            className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 transition"
                        >
                            Obriši trajno
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}