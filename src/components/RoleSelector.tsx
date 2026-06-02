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
  onInstallApp?: () => void;
  showInstallButton?: boolean;
}

export default function RoleSelector({ onSelectRole, onInstallApp, showInstallButton }: RoleSelectorProps) {
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
      <header className="px-6 md:px-12 py-6 flex justify-between items-center w-full bg-white border-b border-slate-100 shadow-xs">
        <div className="flex items-center gap-4">
          <img 
            src="https://cossma.com.mx/bp.jpeg" 
            alt="Tienditas BP Logo" 
            className="h-10 md:h-12 w-auto object-contain rounded-lg shadow-sm" 
            referrerPolicy="no-referrer"
          />
          <span className="text-xl md:text-2xl font-black tracking-tight text-slate-800 uppercase font-display">Tienditas BP</span>
        </div>
        <div className="text-right">
          <p className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest">Portal de Acceso</p>
          <p className="text-[10px] md:text-xs text-slate-400 font-mono">v3.0.0 • Sincronizado</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-10">
        
        {/* Eye-catching PWA install alert banner */}
        {showInstallButton && onInstallApp && (
          <motion.div
            id="pwa-install-badge"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 max-w-lg w-full text-center sm:text-left relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 opacity-10 animate-pulse"></div>
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-2xl shrink-0">✨</span>
              <div>
                <h4 className="font-extrabold text-sm tracking-tight text-white">¡Instala la App Oficial!</h4>
                <p className="text-xs text-indigo-100 font-medium">Accede directo y opera sin internet en eventos.</p>
              </div>
            </div>
            <button
              onClick={onInstallApp}
              className="relative z-10 bg-white hover:bg-slate-50 text-indigo-650 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer shadow-md shrink-0 transform hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto"
            >
              Instalar App 📱
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <img 
            src="https://cossma.com.mx/bp.jpeg" 
            alt="Tienditas BP Logo Grande" 
            className="h-20 md:h-24 w-auto object-contain mx-auto mb-6 rounded-xl shadow-md border border-slate-100" 
            referrerPolicy="no-referrer"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 font-display tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto">
            Selecciona tu perfil de acceso para iniciar sesión en la terminal actual de ventas.
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

