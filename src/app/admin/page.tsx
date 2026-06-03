"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { useAdmin } from "@/lib/admin-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdmin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (login(username, password)) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid credentials");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f3f1] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 bg-[#f5a020] rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white font-bebas-neue">
                CL
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#111113] mb-2 font-bebas-neue">
            Admin
          </h1>
          <p className="text-[#111113]/60 font-barlow-condensed">
            Gestion des emplois - Entreprises Christian Lemelin
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-[#e8e8e6]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-barlow-condensed text-[#111113] mb-2"
              >
                Utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                className="w-full px-4 py-3 rounded-lg border border-[#e8e8e6] bg-[#f3f3f1] text-[#111113] placeholder-[#111113]/40 focus:outline-none focus:ring-2 focus:ring-[#f5a020] focus:border-transparent transition-all font-barlow-condensed"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-barlow-condensed text-[#111113] mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="w-full px-4 py-3 rounded-lg border border-[#e8e8e6] bg-[#f3f3f1] text-[#111113] placeholder-[#111113]/40 focus:outline-none focus:ring-2 focus:ring-[#f5a020] focus:border-transparent transition-all font-barlow-condensed"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600 font-barlow-condensed">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#f5a020] hover:bg-[#d4881a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-barlow-condensed py-3 px-4 rounded-lg transition-all duration-300 font-bold tracking-wide"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 pt-6 border-t border-[#e8e8e6]">
            <p className="text-xs text-[#111113]/60 font-barlow-condensed text-center mb-2">
              Mode développement - Utilisez n'importe quelles informations
              d'identification
            </p>
            <div className="bg-[#f3f3f1] rounded-lg p-3 text-xs font-mono text-[#111113]/80">
              <p>Demo: admin / password</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
