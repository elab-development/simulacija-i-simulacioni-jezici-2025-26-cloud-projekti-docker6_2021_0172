"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// Uvozimo komponente
import AdminDashboard from "@/components/AdminDashboard";
import TransactionHistory from "@/components/TransactionHistory";
import DashboardStats from "@/components/DashboardStats";
import DashboardCharts from "@/components/DashboardCharts"; 
import ExternalWidgets from "@/components/ExternalWidgets";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = () => {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
            const parsedUser = JSON.parse(userJson);
            setUser(parsedUser);
            fetchTransactions(parsedUser.id);
        } catch(e) {
            console.error(e);
            setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const fetchTransactions = async (userId: number) => {
    try {
      const res = await fetch(`/api/transactions?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Greška pri učitavanju transakcija:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Učitavanje...</div>;
  }

  // Scenario za GUEST
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
        <h1 className="text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          SmartBudget 💰
        </h1>
        <p className="text-xl mb-12 text-gray-300 max-w-2xl leading-relaxed">
          Preuzmite kontrolu nad svojim novcem. Pratite troškove, štedite pametno i planirajte budućnost.
        </p>
        <div className="flex gap-6 justify-center">
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition shadow-lg shadow-blue-900/20"
          >
            Prijavi se
          </Link>
          <Link 
            href="/register" 
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-10 rounded-full transition border border-gray-700"
          >
            Registracija
          </Link>
        </div>
      </div>
    );
  }

  // Admin
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  // Obican user
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      
      <div className="flex-grow p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HEADER */}
          <header className="border-b border-gray-800 pb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
                Zdravo, {user.name}!
            </h1>
            <p className="text-gray-400 mt-1">Evo tvog finansijskog preseka.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1 h-full">
              <DashboardStats transactions={transactions} />
            </div>

            <div className="lg:col-span-2 space-y-8">
               <DashboardCharts transactions={transactions} />
               
               {/* <--- 2. UBAČENO OVDE: Eksterni API widgeti ispod chartova ---> */}
               <ExternalWidgets />
               
               <TransactionHistory 
                  transactions={transactions} 
                  onRefresh={() => fetchTransactions(user.id)} 
               />
            </div>

          </div>

        </div>
      </div>

      
    </div>
  );
}