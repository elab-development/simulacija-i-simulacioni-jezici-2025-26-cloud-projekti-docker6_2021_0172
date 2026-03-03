"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button"; 
import Input from "@/components/ui/Input";   

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        router.push("/"); // Prebacujemo ga na Dashboard (Pocetnu), a ne na Wallets
      }, 1000);

    } catch (err) {
      setError("Došlo je do greške.");
      setLoading(false);
    }
  };

  return (
    
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      
      
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Dobrodošli</h2>
            <p className="text-gray-400 mt-2">Unesite podatke za pristup</p>
        </div>
        
        
        {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                ⚠️ {error}
            </div>
        )}
        {success && (
            <div className="bg-green-900/30 border border-green-800 text-green-200 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                ✅ Uspešno! Ulazite...
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
             label="Email adresa"
             type="email"
             required
             placeholder="tvoj@email.com"
             value={formData.email}
             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
             label="Lozinka"
             type="password"
             required
             placeholder="••••••••"
             value={formData.password}
             onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <div className="pt-2">
            <Button type="submit" disabled={loading}>
                {loading ? "Provera..." : "Uloguj se"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Nemaš nalog?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
            Registruj se besplatno
          </Link>
        </p>
      </div>
    </div>
  );
}