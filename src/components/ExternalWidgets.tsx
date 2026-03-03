"use client";

import { useEffect, useState } from "react";

export default function ExternalWidgets() {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [advice, setAdvice] = useState<string>("Učitavanje saveta...");

  useEffect(() => {
    // 1. Eksterni API: Kursna lista
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/EUR");
        const data = await res.json();
        setExchangeRate(data.rates.RSD);
      } catch (error) {
        console.error("Greška pri učitavanju kursa:", error);
      }
    };

    // 2. Eksterni API: Savet dana (AdviceSlip API)
    const fetchAdvice = async () => {
      try {
        const res = await fetch("https://api.adviceslip.com/advice");
        const data = await res.json();
        setAdvice(data.slip.advice);
      } catch (error) {
        setAdvice("Štednja je prvi korak ka finansijskoj slobodi.");
      }
    };

    fetchExchangeRate();
    fetchAdvice();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Widget 1: Kurs */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-2xl">
          💶
        </div>
        <div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider">Trenutni Kurs (EUR/RSD)</h3>
          <p className="text-2xl font-bold text-white">
            {exchangeRate ? `1 € = ${exchangeRate.toFixed(2)} RSD` : "Učitavanje..."}
          </p>
        </div>
      </div>

      {/* Widget 2: Savet */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center text-2xl">
          💡
        </div>
        <div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider">Poruka Dana</h3>
          <p className="text-md font-medium text-white italic">
            "{advice}"
          </p>
        </div>
      </div>
    </div>
  );
}