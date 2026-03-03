"use client";

import { useMemo } from "react";

interface Transaction {
  id: number;
  amount: number | string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  date: string;
  category?: { name: string };
}

export default function DashboardStats({ transactions }: { transactions: Transaction[] }) {
  
  // racunanje statistike
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // filtriramo transakcije samo iz ovog meseca
    const thisMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    let income = 0;
    let expense = 0;
    const categoryMap: Record<string, number> = {};

    thisMonthTransactions.forEach(t => {
      const amt = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      
      if (t.type === "INCOME") {
        income += amt;
      } else if (t.type === "EXPENSE") {
        expense += amt;
        // sabiramo troskove po kategorijama
        const catName = t.category?.name || "Ostalo";
        categoryMap[catName] = (categoryMap[catName] || 0) + amt;
      }
    });

    // sortiramo kategorije da nadjemo top 3
    const topCategories = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => ({
        name,
        value,
        percentage: expense > 0 ? (value / expense) * 100 : 0
      }));

    const savings = income - expense;
    // Koliko je % potroseno od prihoda
    const spentPercentage = income > 0 ? Math.min((expense / income) * 100, 100) : 0;

    return { income, expense, savings, topCategories, spentPercentage };
  }, [transactions]);

  return (
    <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700 h-full flex flex-col justify-between">
      
      {/* GLAVNI NASLOV */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Mesečni pregled 📊</h2>
        <p className="text-sm text-gray-400">Statistika za tekući mesec</p>
      </div>

      {/* 1. GLAVNI BAR: PRIHODI vs RASHODI */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Potrošeno</span>
          <span className="text-white font-bold">{stats.spentPercentage.toFixed(0)}% <span className="text-gray-500 font-normal">prihoda</span></span>
        </div>
        
        {/* Pozadina bara */}
        <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden shadow-inner">
            {/* Linija potrosnje */}
            <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    stats.spentPercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-blue-400'
                }`}
                style={{ width: `${stats.spentPercentage}%` }}
            ></div>
        </div>

        <div className="flex justify-between mt-3 text-sm">
             <div>
                <p className="text-gray-500 text-xs">Prihodi</p>
                <p className="text-green-400 font-bold">+{stats.income.toLocaleString()}</p>
             </div>
             <div className="text-right">
                <p className="text-gray-500 text-xs">Rashodi</p>
                <p className="text-red-400 font-bold">-{stats.expense.toLocaleString()}</p>
             </div>
        </div>
      </div>

      {/* 2. TOP 3 KATEGORIJE */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Najveći troškovi</h3>
        
        {stats.topCategories.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Nema troškova ovog meseca.</p>
        ) : (
            <div className="space-y-4">
                {stats.topCategories.map((cat, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-white">{cat.name}</span>
                            <span className="text-gray-400">{cat.value.toLocaleString()} RSD</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-yellow-500/80 rounded-full" 
                                style={{ width: `${cat.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* 3. REZULTAT (USTEDA) */}
      <div className={`mt-6 p-4 rounded-xl border ${stats.savings >= 0 ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
         <p className="text-gray-400 text-xs mb-1">Trenutno stanje</p>
         <p className={`text-xl font-bold ${stats.savings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.savings >= 0 ? 'U plusu si' : 'U minusu si'}: {Math.abs(stats.savings).toLocaleString()} RSD
         </p>
      </div>

    </div>
  );
}