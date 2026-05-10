import React from 'react';
import { LayoutDashboard, FilePlus, Files, Palette, Settings, Sun, Moon, Download, Upload, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeView: string;
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  isOpen,
  onClose,
  onViewChange, 
  isDarkMode, 
  toggleDarkMode 
}) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'new-invoice', icon: FilePlus, label: 'New Invoice' },
    { id: 'my-bills', icon: Files, label: 'My Bills' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "no-print fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-6 px-2 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <FilePlus size={18} />
        </div>
        <h1 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">SMARTBILL</h1>
      </div>

      <nav className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Menu</label>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
              activeView === item.id 
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-l-4 border-indigo-600 rounded-l-none" 
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>

    </aside>
    </>
  );
};
