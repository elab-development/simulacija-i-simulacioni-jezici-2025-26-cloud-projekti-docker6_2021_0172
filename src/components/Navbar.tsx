"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Greška", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [pathname]);

  // Sakrij Navbar dok se ne učita status korisnika
  if (loading) return null;

  // Sakrij Navbar na login/register stranama
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  // Sakrij Navbar na početnoj strani ako je korisnik GOST (nije ulogovan)
  if (pathname === "/" && !user) {
    return null;
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Moraš dodati 'async' ispred funkcije jer koristimo 'await'
  const confirmLogout = async () => {
    
    // 1. POZIV BACKEND RUTE (Ovo smo dodali zbog zahteva projekta)
    try {
        await fetch("/api/logout", { method: "POST" });
    } catch (error) {
        console.error("Greška na serveru pri odjavi (zanemarljivo):", error);
    }

    // 2. BRISANJE LOKALNIH PODATAKA (Tvoj postojeći kod)
    localStorage.removeItem("user");
    setUser(null);
    setShowLogoutModal(false);
    
    // 3. PREUSMERAVANJE (Tvoj postojeći kod)
    // Ovo je super jer osvežava celu aplikaciju i briše sve keširane podatke
    window.location.href = "/";
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <nav className="sticky top-0 z-40 bg-gray-800/90 backdrop-blur-md border-b border-gray-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            <div className="flex items-center gap-8">
              <Link href={user ? "/" : "/"} className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50 group-hover:scale-105 transition-transform">
                  $
                </div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  SmartBudget
                </span>
              </Link>

              {!isAdmin && (
                <div className="hidden md:flex gap-1">
                  <Link href="/wallets" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/wallets' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                    Moji Novčanici
                  </Link>
                  <Link href="/budgets" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/budgets" ? "bg-gray-700 text-blue-400" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}>
                    Budžeti
                  </Link>
                  <Link href="/transfer" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/transfer' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                    Prenos Novca
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isAdmin && (
                <Link href="/transactions/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition shadow-lg shadow-blue-900/20 flex items-center gap-2">
                    <span>＋</span> <span className="hidden sm:inline">Nova Transakcija</span>
                </Link>
              )}

              <div className="h-6 w-px bg-gray-600 mx-1"></div>

              <div className="flex items-center gap-3">
                 {user && (
                   <span className="text-sm font-semibold text-gray-300 block">
                      {user.name} {isAdmin && <span className="text-blue-400 text-xs ml-1">(Admin)</span>}
                   </span>
                 )}
                 
                 <button onClick={handleLogoutClick} className="text-sm font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all duration-200 border border-red-500/20">
                   Odjavi se
                 </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
           <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  🚪
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Odjavljivanje</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Da li ste sigurni da želite da se odjavite sa sistema?
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition">
                  Odustani
                </button>
                <button onClick={confirmLogout} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 transition">
                  Da, odjavi me
                </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}