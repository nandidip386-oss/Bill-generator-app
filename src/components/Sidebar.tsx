import React, { useState, useEffect } from 'react';
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if it already fired
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleCustomInstallableEvent = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        setIsInstallable(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('app-installable', handleCustomInstallableEvent);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('app-installable', handleCustomInstallableEvent);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
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

      {isInstallable && (
        <div className="mt-8 px-3">
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-indigo-700 shadow-md"
          >
            <Download size={16} />
            Install App
          </button>
        </div>
      )}

    </aside>
    </>
  );
};
