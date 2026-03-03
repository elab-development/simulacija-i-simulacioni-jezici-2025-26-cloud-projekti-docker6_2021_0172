"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  if (loading) return null;

  // Sakrij footer na stranicama za logovanje i registraciju
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  // Sakrij footer na pocetnoj strani ako korisnik NIJE ulogovan (Landing page)
  if (pathname === "/" && !user) {
    return null;
  }

  // Provera da li je Admin
  const isAdmin = user?.role === "ADMIN";

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Kolona 1: O Projektu */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
               <span className="text-blue-500 text-xl">$</span> SmartBudget
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Aplikacija za pametno upravljanje ličnim finansijama. 
              Pratite troškove, planirajte budžet i štedite pametnije.
            </p>
          </div>

          {/* Kolona 2: Navigacija */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Brzi Linkovi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition">
                  Početna
                </Link>
              </li>

              {/* Prikazujemo ove linkove SAMO ako nije Admin i ako je ulogovan */}
              {!isAdmin && user && (
                <>
                  <li>
                    <Link href="/wallets" className="hover:text-blue-400 transition">
                      Moji Novčanici
                    </Link>
                  </li>
                  <li>
                    <Link href="/budgets" className="hover:text-blue-400 transition">
                      Budžeti
                    </Link>
                  </li>
                  <li>
                    <Link href="/transfer" className="hover:text-blue-400 transition">
                      Prenos Novca
                    </Link>
                  </li>
                  <li>
                    <Link href="/transactions/add" className="hover:text-blue-400 transition">
                      Nova Transakcija
                    </Link>
                  </li>
                </>
              )}
              
              {/* DODAT LINK ZA API DOKUMENTACIJU (Vidljiv svima koji vide Footer) */}
              <li className="pt-2">
                <Link href="/api-docs" className="text-gray-500 hover:text-white transition flex items-center justify-center md:justify-start gap-2">
                  <span>📖</span> API Dokumentacija
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Kolona 3: Studenti */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Studenti</h3>
            <div className="text-sm space-y-1 text-gray-500">
              <p>Jovan Janjušević <span className="text-gray-600">(2021/0172)</span></p>
              <p>Miloš Purić <span className="text-gray-600">(2021/0100)</span></p>
              <p className="mt-4 text-blue-400">Fakultet Organizacionih Nauka</p>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} SmartBudget. Sva prava zadržana.
        </div>
      </div>
    </footer>
  );
}