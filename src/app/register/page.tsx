"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Greška pri registraciji");
        setLoading(false);
        return;
      }

      // Ako je uspesno, idi na login
      router.push("/login");

    } catch (err) {
      setError("Došlo je do greške na serveru.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Napravi nalog</h2>
            <p className="text-gray-400 mt-2">Pridruži se SmartBudget ekipi</p>
        </div>
        
        {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-xl mb-6 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
             label="Ime i prezime"
             type="text"
             required
             placeholder="Petar Petrović"
             value={formData.name}
             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

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
                {loading ? "Kreiranje..." : "Registruj se"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Već imaš nalog?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
            Uloguj se ovde
          </Link>
        </p>
      </div>
    </div>
  );
}