import React, { useState } from 'react';
import { PHP_CODEBASE, PhpFileDefinition } from '../phpCodebase';
import { 
  FileCode, 
  FolderTree, 
  Copy, 
  Check, 
  Download, 
  Server, 
  Database, 
  ShieldCheck, 
  Code2, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';

export const PhpBackendViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PhpFileDefinition>(PHP_CODEBASE[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const filteredFiles = PHP_CODEBASE.filter(f => 
    categoryFilter === 'todos' || f.category === categoryFilter
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Adiciona cada arquivo PHP no zip mantendo a estrutura de pastas
      PHP_CODEBASE.forEach(f => {
        zip.file(f.path, f.code);
      });

      // Adiciona um README explicativo no ZIP
      zip.file('README.md', `# GestãoSaaS - Sistema Completo em PHP Puro & MySQL

## Requisitos
- PHP 8.0 ou superior com extensões: pdo, pdo_mysql, session, json.
- MySQL 5.7+ ou MariaDB 10.3+.
- Servidor Web Apache com mod_rewrite ou Nginx.

## Como Executar Localmente
1. Configure as credenciais no arquivo 'config/Database.php' (Host, DBName, User, Password).
2. O sistema possui auto-instalação: ao abrir o sistema no navegador, 'Config\\Database::getInstance()' criará automaticamente o banco de dados e as tabelas caso não existam.
3. Acesse 'index.php' no seu navegador ou inicie o servidor interno do PHP:
   \`php -S localhost:8000\`
4. Credenciais padrão de demonstração:
   - Admin Global: admin@saas.com.br / Admin@123
   - Dono da Empresa: dono@empresa.com.br / Dono@123
`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gestao_saas_php_mysql.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Código-Fonte Back-End: PHP Puro & MySQL</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Arquitetura modular em PHP 8.x estruturada por funcionalidades, com PDO Prepared Statements, sessões nativas, RBAC e auto-criação de banco.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Compactando...' : 'Baixar Back-End Completo (.ZIP)'}</span>
        </button>
      </div>

      {/* Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left: Files Navigation */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 block mb-2">Estrutura de Arquivos PHP:</span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                onClick={() => setCategoryFilter('todos')}
                className={`py-1 px-2 rounded font-semibold ${categoryFilter === 'todos' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
              >
                Todos ({PHP_CODEBASE.length})
              </button>
              <button
                onClick={() => setCategoryFilter('database')}
                className={`py-1 px-2 rounded font-semibold ${categoryFilter === 'database' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
              >
                MySQL / SQL
              </button>
              <button
                onClick={() => setCategoryFilter('config')}
                className={`py-1 px-2 rounded font-semibold ${categoryFilter === 'config' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
              >
                PDO & Sessões
              </button>
              <button
                onClick={() => setCategoryFilter('auth')}
                className={`py-1 px-2 rounded font-semibold ${categoryFilter === 'auth' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
              >
                Login & Registro
              </button>
              <button
                onClick={() => setCategoryFilter('modulos')}
                className={`py-1 px-2 rounded font-semibold ${categoryFilter === 'modulos' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
              >
                Estoque/Produtos
              </button>
              <button
                onClick={() => setCategoryFilter('admin')}
                className={`py-1 px-2 rounded font-semibold ${categoryFilter === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
              >
                Admin Empresas
              </button>
            </div>
          </div>

          <div className="p-2 divide-y divide-slate-100 overflow-y-auto max-h-[500px] flex-1">
            {filteredFiles.map(file => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                  selectedFile.path === file.path 
                    ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${selectedFile.path === file.path ? 'text-purple-600' : 'text-slate-400'}`} />
                <div className="overflow-hidden">
                  <div className="truncate font-mono text-[11px]">{file.path}</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                    {file.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 shadow-xl flex flex-col overflow-hidden">
          {/* Top action bar */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-mono text-purple-400 font-bold">{selectedFile.path}</span>
              <span className="text-[10px] text-slate-500">• {selectedFile.description}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="p-4 overflow-auto max-h-[520px] flex-1 bg-slate-950/60 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre selection:bg-purple-600 selection:text-white">
            {selectedFile.code}
          </div>
        </div>
      </div>
    </div>
  );
};
