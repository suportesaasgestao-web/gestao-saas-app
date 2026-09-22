import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Monitor, 
  Smartphone, 
  Apple, 
  X, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  Laptop, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'mac' | 'windows' | 'linux' | 'chromeos' | 'other'>('other');

  useEffect(() => {
    // Detect if already installed as PWA / Standalone
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // Detect Platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else if (/macintosh|mac os x/.test(ua)) {
      setPlatform('mac');
    } else if (/cros/.test(ua)) {
      setPlatform('chromeos');
    } else if (/linux/.test(ua)) {
      setPlatform('linux');
    } else if (/windows/.test(ua)) {
      setPlatform('windows');
    }

    // Listen for PWA install prompt (Chrome, Edge, Android, ChromeOS, Opera)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
        setShowModal(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  if (isStandalone) {
    return null; // Already running as installed standalone app!
  }

  const getPlatformLabel = () => {
    switch (platform) {
      case 'ios': return 'iPhone / iPad (iOS)';
      case 'android': return 'Android';
      case 'mac': return 'macOS (Mac)';
      case 'windows': return 'Windows PC';
      case 'chromeos': return 'ChromeOS';
      case 'linux': return 'Linux';
      default: return 'PC & Celular';
    }
  };

  return (
    <>
      {/* Botão sutil ou banner no topo/lateral quando não dispensado */}
      {!dismissed && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs transition-all z-20">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <span className="font-extrabold tracking-wide mr-1.5">Instalar GestãoSaaS:</span>
              <span className="opacity-90 hidden sm:inline">
                Aplicativo disponível para PC (Windows/Linux), Android, macOS, iPhone e ChromeOS.
              </span>
              <span className="opacity-90 sm:hidden">
                App para {getPlatformLabel()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-blue-800 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar no {getPlatformLabel()}</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-white/75 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Fechar aviso"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Instruções de Instalação Multiplataforma */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-6 text-slate-800">
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Instalar GestãoSaaS</h3>
                  <p className="text-xs text-slate-500">Compatível com PC, Android, macOS, iOS, Linux e ChromeOS</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruções por Plataforma */}
            <div className="space-y-4 text-xs">
              {platform === 'ios' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <Apple className="w-4 h-4" />
                    <span>Como instalar no iPhone ou iPad (iOS Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed font-medium">
                    <li>Abra este site no navegador <strong>Safari</strong> do seu iPhone.</li>
                    <li>
                      Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com uma seta para cima <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" />) na barra inferior.
                    </li>
                    <li>
                      Role a lista para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-blue-600" />.
                    </li>
                    <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
                  </ol>
                  <p className="text-[11px] text-blue-700 pt-1 font-medium">
                    O ícone oficial do GestãoSaaS será adicionado à sua tela inicial funcionando como um aplicativo nativo em tela cheia!
                  </p>
                </div>
              )}

              {platform === 'android' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <Smartphone className="w-4 h-4" />
                    <span>Como instalar no Android:</span>
                  </div>
                  {deferredPrompt ? (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Instalar Agora no Android</span>
                    </button>
                  ) : (
                    <p className="text-slate-700 leading-relaxed">
                      Toque no menu de 3 pontinhos do navegador Chrome e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </p>
                  )}
                </div>
              )}

              {(platform === 'windows' || platform === 'mac' || platform === 'linux' || platform === 'chromeos') && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                    <Monitor className="w-4 h-4" />
                    <span>Como instalar no PC, Mac, Linux ou Chromebook:</span>
                  </div>
                  {deferredPrompt ? (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Instalar Aplicativo no Computador</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5 text-slate-700 leading-relaxed font-medium">
                      <p>
                        No Chrome, Edge ou Brave, localize o ícone de <strong>Instalar</strong> <Download className="w-3.5 h-3.5 inline text-purple-600" /> diretamente na barra de endereços (lado direito).
                      </p>
                      <p>
                        Ou clique no menu do navegador (três pontos) &gt; <strong>"Instalar GestãoSaaS..."</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Grid com todas as 6 plataformas suportadas */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Plataformas Oficiais Suportadas
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-1">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800">PC / Windows</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">100% Suportado</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-1">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">Android</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">PWA / WebAPK</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-1">
                    <Apple className="w-4 h-4 text-slate-800" />
                    <span className="font-bold text-slate-800">macOS</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">App Nativo</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-1">
                    <Smartphone className="w-4 h-4 text-slate-700" />
                    <span className="font-bold text-slate-800">iPhone / iOS</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Tela Inicial</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-1">
                    <Laptop className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-slate-800">Linux</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Instalável</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-1">
                    <Monitor className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-800">ChromeOS</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">App Oficial</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Instalação segura, rápida e sem necessidade de loja de apps
              </span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
