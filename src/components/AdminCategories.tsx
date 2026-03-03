"use client";

import { useEffect, useState } from "react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("EXPENSE");
  const [loading, setLoading] = useState(true);

  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, type: newCatType }),
      });
      if (res.ok) {
        setNewCatName("");
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // funkcija za brisanje
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // azuriramo listu bez ponovnog ucitavanja sa servera
        setCategories(categories.filter((c) => c.id !== categoryToDelete));
        setCategoryToDelete(null); // Zatvaramo modal
      } else {
        alert("Greška: Nije moguće obrisati kategoriju (možda se koristi u transakcijama?)");
      }
    } catch (error) {
      console.error("Greška pri brisanju:", error);
    }
  };

  if (loading) return <div className="text-white">Učitavanje kategorija...</div>;

  return (
    <div className="space-y-8">
      
      {/* FORMA ZA DODAVANJE */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Dodaj novu kategoriju</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Naziv</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="npr. Gorivo"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tip</label>
            <select
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="EXPENSE">Trošak</option>
              <option value="INCOME">Prihod</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Dodaj
          </button>
        </form>
      </div>

      {/* LISTA KATEGORIJA */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-800 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Naziv</th>
              <th className="px-6 py-3">Tip</th>
              <th className="px-6 py-3 text-right">Akcija</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-800/50 transition">
                <td className="px-6 py-4 text-gray-500">#{cat.id}</td>
                <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      cat.type === "INCOME"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {cat.type === "INCOME" ? "PRIHOD" : "TROŠAK"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   {/* DUGME ZA OTVARANJE MODALA */}
                   <button 
                      onClick={() => setCategoryToDelete(cat.id)}
                      className="text-gray-500 hover:text-red-500 transition p-2 hover:bg-red-500/10 rounded-full"
                      title="Obriši kategoriju"
                   >
                      🗑️
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ZA POTVRDU BRISANJA */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
           <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 animate-in fade-in zoom-in duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Brisanje kategorije</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Da li ste sigurni? Ovo može uticati na postojeće transakcije koje koriste ovu kategoriju.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setCategoryToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition"
                >
                  Odustani
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 transition"
                >
                  Obriši trajno
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}