"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface DashboardChartsProps {
  transactions: any[];
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function DashboardCharts({ transactions }: DashboardChartsProps) {
  
  // priprema podataka za pie chart
  const pieData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "EXPENSE");
    
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((t) => {
      const catName = t.category?.name || "Ostalo";
      categoryTotals[catName] = (categoryTotals[catName] || 0) + Number(t.amount);
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  // priprema podataka za bar chart
  const barData = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === "INCOME") income += Number(t.amount);
      if (t.type === "EXPENSE") expense += Number(t.amount);
    });

    return [
      { name: "Prihodi", iznos: income },
      { name: "Troškovi", iznos: expense },
    ];
  }, [transactions]);

  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* pie chart */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col items-center">
        <h3 className="text-lg font-bold text-white mb-4">Struktura Troškova</h3>
        {pieData.length > 0 ? (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: 'white' }} 
                    // 👇 IZMENA: Stavili smo 'any' da popravimo grešku
                    formatter={(value: any) => `${Number(value).toLocaleString()} RSD`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 my-auto">Nema troškova za prikaz.</p>
        )}
      </div>

      {/* bar chart */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col items-center">
        <h3 className="text-lg font-bold text-white mb-4">Prihodi vs Troškovi</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: 'white' }}
                formatter={(value: any) => `${Number(value).toLocaleString()} RSD`}
              />
              <Bar dataKey="iznos" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === "Prihodi" ? "#10B981" : "#EF4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}