import React, { useState } from 'react';
import { Company } from '../types';
import { 
  Settings, 
  Building2, 
  Image, 
  Palette, 
  Save, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  Upload
} from 'lucide-react';

interface SettingsViewProps {
  currentCompany: Company | null;
  onSaveSettings: (updated: Partial<Company>) => void;
  language: 'pt-BR' | 'en' | 'es';
  onLanguageChange: (language: 'pt-BR' | 'en' | 'es') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentCompany,
  onSaveSettings,
  language,
  onLanguageChange
}) => {
  const [nomeFantasia, setNomeFantasia] = useState(currentCompany?.nome_fantasia || '');
  const [razaoSocial, setRazaoSocial] = useState(currentCompany?.razao_social || '');
  const [cnpj, setCnpj] = useState(currentCompany?.cnpj || '');
  const [telefone, setTelefone] = useState(currentCompany?.telefone || '');
  const [email, setEmail] = useState(currentCompany?.email || '');
  const [endereco, setEndereco] = useState(currentCompany?.endereco || '');
  const [cidade, setCidade] = useState(currentCompany?.cidade || '');
  const [estado, setEstado] = useState(currentCompany?.estado || 'SP');
  const [logoUrl, setLogoUrl] = useState(currentCompany?.logo_url || '');
  const [bannerUrl, setBannerUrl] = useState(currentCompany?.banner_url || '');
  const [corTema, setCorTema] = useState(currentCompany?.cor_tema || '#2563eb');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      nome_fantasia: nomeFantasia,
      razao_social: razaoSocial,
      cnpj,
      telefone,
      email,
      endereco,
      cidade,
      estado,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      cor_tema: corTema
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Presets para testes rápidos
  const logoPresets = [
    { name: 'Moderna Tech', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' },
    { name: 'Comércio / Varejo', url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=150&auto=format&fit=crop&q=80' },
    { name: 'Minimalista Azul', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' }
  ];

  const bannerPresets = [
    { name: 'Corporativo Moderno', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80' },
    { name: 'Armazém / Logística', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80' },
    { name: 'Tecnologia & Escritório', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Preferências do sistema</h3>
        </div>
        <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="language">
          Idioma do aplicativo
        </label>
        <select
          id="language"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value as 'pt-BR' | 'en' | 'es')}
          className="w-full max-w-xs text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
        <p className="text-[11px] text-slate-500 mt-2">A preferência fica salva neste computador.</p>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Configuração do Painel & Identidade Visual</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personalize a marca da sua empresa: defina o logotipo, banner do cabeçalho, paleta de cores e dados cadastrais.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Visual Identity Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Palette className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Identidade Visual (Logo, Banner e Cores)</h3>
          </div>

          {/* Live Preview Box */}
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">Pré-visualização do Topo do Painel:</span>
            <div className="relative rounded-xl overflow-hidden h-36 border border-slate-200 bg-slate-800">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center text-slate-500 text-xs">
                  Sem banner configurado
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent flex items-center px-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white p-1 shadow-md border border-slate-200 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                    ) : (
                      <Building2 className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <div className="text-white">
                    <h4 className="text-lg font-bold">{nomeFantasia || 'Nome da Sua Empresa'}</h4>
                    <p className="text-xs text-slate-300">CNPJ: {cnpj || '00.000.000/0001-00'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL da Imagem do Logotipo</label>
              <input
                type="url"
                placeholder="https://..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-500">Sugestões:</span>
                {logoPresets.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setLogoUrl(preset.url)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL da Imagem do Banner</label>
              <input
                type="url"
                placeholder="https://..."
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-500">Sugestões:</span>
                {bannerPresets.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setBannerUrl(preset.url)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Company Legal & Contact Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Dados Empresariais & Fiscais</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia *</label>
              <input
                type="text"
                required
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social *</label>
              <input
                type="text"
                required
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Principal</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Comercial</label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estado (UF)</label>
              <input
                type="text"
                maxLength={2}
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 uppercase font-bold"
              />
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações da Empresa</span>
          </button>
        </div>
      </form>
    </div>
  );
};
