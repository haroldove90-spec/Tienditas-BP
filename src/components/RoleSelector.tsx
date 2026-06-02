/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserCog, ShoppingBag } from 'lucide-react';
import { Role } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
}

export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const [timeStr, setTimeStr] = useState('20:59');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="role-selector-container" className="min-h-screen flex flex-col justify-between bg-[#F9FAFB] font-sans text-slate-900 overflow-hidden">
      {/* Header Section */}
      <header className="px-6 md:px-12 py-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 uppercase font-display">Nexus POS</span>
        </div>
        <div className="text-right">
          <p className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-widest">Portal de Acceso</p>
          <p className="text-[10px] md:text-xs text-slate-400 font-mono">v2.4.0 • Sincronizado</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-light text-slate-800 mb-2 font-display">
            Bienvenido de nuevo
          </h1>
          <p className="text-slate-450 text-sm md:text-lg max-w-md mx-auto">
            Por favor, seleccione su rol para iniciar sesión en la terminal
          </p>
        </motion.div>

        {/* Roles Selection Grid */}
        <div id="roles-grid" className="flex flex-col md:flex-row gap-8 md:gap-12 w-full max-w-3xl justify-center items-center">
          {/* Admin Role Card */}
          <motion.div
            id="role-card-admin"
            whileHover={{ y: -6 }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => onSelectRole('admin')}
            className="group cursor-pointer"
          >
            <div className="w-72 h-80 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-8 border-b-4 border-b-indigo-500 transition-all duration-300 hover:shadow-xl">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <UserCog id="icon-admin" className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2 font-display">Administrador</h2>
              <p className="text-slate-400 text-center text-sm px-4 leading-relaxed">
                Gestión de inventario, productos y reportes financieros
              </p>
            </div>
          </motion.div>

          {/* Seller Role Card */}
          <motion.div
            id="role-card-vendedor"
            whileHover={{ y: -6 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={() => onSelectRole('vendedor')}
            className="group cursor-pointer"
          >
            <div className="w-72 h-80 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-8 border-b-4 border-b-emerald-500 transition-all duration-300 hover:shadow-xl">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <ShoppingBag id="icon-vendedor" className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2 font-display">Vendedor</h2>
              <p className="text-slate-400 text-center text-sm px-4 leading-relaxed">
                Terminal de ventas rápida, facturación y control de caja
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="px-6 md:px-12 py-10 flex justify-between items-end text-slate-400 w-full mt-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] md:text-xs font-medium uppercase tracking-widest">Terminal 01 Activa</span>
          </div>
          <span className="text-[10px] md:text-xs text-slate-400 font-mono">Sucursal: Central Norte</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl md:text-2xl font-light text-slate-600 font-mono">{timeStr}</span>
          <span className="text-[9px] md:text-[10px] uppercase tracking-tighter text-slate-400">Hora local de terminal</span>
        </div>
      </footer>
    </div>
  );
}

