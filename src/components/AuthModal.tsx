import React, { useState, useEffect } from 'react';
import { Company, User } from '../types';
import { 
  Building2, 
  Lock, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Building,
  User as UserIcon,
  Phone,
  X,
  Clock,
  Copy,
  Check,
  RefreshCw,
  LifeBuoy,
  Send,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export const SUPPORT_EMAIL = 'suportesaasgestao@gmail.com';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFullScreen?: boolean;
  onSuccessLogin: (user: User, company: Company | null) => void;
  onRegisterCompany: (companyData: {
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    email: string;
    telefone: string;
    nome_dono: string;
    email_dono: string;
    senha_dono: string;
  }) => { success: boolean; message: string };
  onResetPassword?: (emailOrCnpj: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  onRequestRecoveryCode?: (email: string) => Promise<{ success: boolean; message: string }>;
  onVerifyRecoveryCode?: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  companies: Company[];
  users: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isFullScreen = false,
  onSuccessLogin,
  onRegisterCompany,
  onResetPassword,
  onRequestRecoveryCode,
  onVerifyRecoveryCode,
  companies,
  users
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'recover'>('login');

  // Login form
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');

  // Register form
  const [regRazao, setRegRazao] = useState('');
  const [regFantasia, setRegFantasia] = useState('');
  const [regCnpj, setRegCnpj] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regNomeDono, setRegNomeDono] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regErrorMessage, setRegErrorMessage] = useState('');

  // Recover form (Código SMS/E-mail com expiração de 15 minutos)
  const [recEmail, setRecEmail] = useState('');
  const [recStep, setRecStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [enteredCode, setEnteredCode] = useState('');
  const [recNewPassword, setRecNewPassword] = useState('');
  const [recConfirmPassword, setRecConfirmPassword] = useState('');
  const [recError, setRecError] = useState('');
  const [recSuccess, setRecSuccess] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  // Efeito de contagem regressiva de 15 minutos (900 segundos)
  useEffect(() => {
    if (!codeExpiresAt || recStep !== 'verify') return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((codeExpiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [codeExpiresAt, recStep]);

  if (!isOpen) return null;

  // Formatação de tempo mm:ss
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopySupportEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const getMailtoLink = (subjectContext = 'Ajuda com Recuperação de Senha') => {
    const subj = encodeURIComponent(`Suporte GestãoSaaS - ${subjectContext}`);
    const body = encodeURIComponent(
      `Olá Suporte,\n\nEstou precisando de ajuda com o meu acesso ao GestãoSaaS.\n\nE-mail ou CNPJ informado: ${recEmail || identifier || '(não informado)'}\nSituação: `
    );
    return `mailto:${SUPPORT_EMAIL}?subject=${subj}&body=${body}`;
  };

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = identifier.trim();
    const cleanDigits = cleanInput.replace(/\D/g, '');

    // Busca usuário por CNPJ ou por E-mail
    let matchedUser: User | undefined;
    let matchedCompany: Company | null = null;

    if (cleanDigits.length === 14) {
      // Login por CNPJ da empresa
      matchedCompany = companies.find(c => c.cnpj && c.cnpj.replace(/\D/g, '') === cleanDigits) || null;
      if (matchedCompany) {
        matchedUser = users.find(u => u.empresa_id === matchedCompany!.id && (u.perfil === 'dono' || u.perfil === 'gerente'));
      }
    } else {
      // Login por E-mail
      matchedUser = users.find(u => u.email.toLowerCase() === cleanInput.toLowerCase());
      if (matchedUser && matchedUser.empresa_id) {
        matchedCompany = companies.find(c => c.id === matchedUser!.empresa_id) || null;
      }
    }

    if (!matchedUser) {
      setLoginError('Nenhum usuário ou empresa encontrado com este E-mail/CNPJ.');
      return;
    }

    // Validação de Senha (se definida pelo usuário no cadastro)
    if (matchedUser.senha && loginPassword && matchedUser.senha !== loginPassword) {
      setLoginError('Senha incorreta. Verifique a senha digitada.');
      return;
    }

    // Se for admin, não precisa de empresa
    if (matchedUser.perfil === 'admin') {
      onSuccessLogin(matchedUser, null);
      onClose();
      return;
    }

    // Validação de Status da Empresa
    if (matchedCompany) {
      if (matchedCompany.status === 'rejeitada' || matchedCompany.status === 'suspensa') {
        setLoginError(`Acesso bloqueado: o status da empresa é ${matchedCompany.status.toUpperCase()}. Entre em contato com o suporte.`);
        return;
      }
    }

    onSuccessLogin(matchedUser, matchedCompany);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMessage('');
    setLoginSuccessMessage('');

    if (!regRazao || !regCnpj || !regNomeDono || !regEmail || !regSenha) {
      setRegErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const res = onRegisterCompany({
      razao_social: regRazao,
      nome_fantasia: regFantasia || regRazao,
      cnpj: regCnpj,
      email: regEmail,
      telefone: regTelefone,
      nome_dono: regNomeDono,
      email_dono: regEmail,
      senha_dono: regSenha
    });

    if (res.success) {
      // 1. Preenche o campo de login com o e-mail ou CNPJ recém-cadastrado
      const loginTarget = regEmail || regCnpj;
      setIdentifier(loginTarget);
      setLoginPassword('');
      setLoginError('');

      // 2. Define a mensagem de sucesso que aparecerá na tela de login
      setLoginSuccessMessage(res.message || 'Empresa cadastrada com sucesso! Realize o login para acessar o sistema.');

      // 3. REDIRECIONA AUTOMATICAMENTE DIRETO PARA O LOGIN!
      setTab('login');

      // 4. Limpa os campos do formulário de cadastro
      setRegRazao('');
      setRegFantasia('');
      setRegCnpj('');
      setRegEmail('');
      setRegTelefone('');
      setRegNomeDono('');
      setRegSenha('');
      setRegErrorMessage('');
    } else {
      setRegErrorMessage(res.message);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError('');
    setRecSuccess('');

    const cleanInput = recEmail.trim();
    if (!cleanInput) {
      setRecError('Informe seu e-mail cadastrado ou CNPJ da sua empresa.');
      return;
    }

    if (!onRequestRecoveryCode) {
      setRecError('A recuperação de senha não está configurada.');
      return;
    }

    const result = await onRequestRecoveryCode(cleanInput);
    if (!result.success) {
      setRecError(result.message);
      return;
    }
    setGeneratedCode('sent');
    setCodeExpiresAt(Date.now() + 15 * 60 * 1000);
    setSecondsLeft(15 * 60);
    setEnteredCode('');
    setRecStep('verify');
    setRecSuccess(result.message);
  };

  const handleResendCode = async () => {
    setRecError('');
    if (!onRequestRecoveryCode) return;
    const result = await onRequestRecoveryCode(recEmail);
    if (!result.success) {
      setRecError(result.message);
      return;
    }
    setGeneratedCode('sent');
    setCodeExpiresAt(Date.now() + 15 * 60 * 1000);
    setSecondsLeft(15 * 60);
    setEnteredCode('');
    setRecSuccess(result.message);
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError('');

    // Verifica expiração de 15 minutos
    if (secondsLeft <= 0 || (codeExpiresAt && Date.now() > codeExpiresAt)) {
      setRecError('⚠️ Este código expirou após o limite de 15 minutos! Clique em "Reenviar Novo Código" ou contate nosso suporte direto por e-mail.');
      return;
    }

    if (!enteredCode || enteredCode.trim().length !== 6) {
      setRecError('Digite os 6 dígitos completos do código de verificação recebido.');
      return;
    }

    if (!onVerifyRecoveryCode) {
      setRecError('A validação de código não está configurada.');
      return;
    }

    const result = await onVerifyRecoveryCode(recEmail, enteredCode);
    if (!result.success) {
      setRecError(result.message);
      return;
    }
    setRecStep('new_password');
    setRecSuccess(result.message);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError('');

    if (!recNewPassword || recNewPassword.length < 6) {
      setRecError('A nova senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (recNewPassword !== recConfirmPassword) {
      setRecError('As senhas digitadas não coincidem. Verifique a confirmação.');
      return;
    }

    setIsSubmittingReset(true);
    try {
      if (onResetPassword) {
        const res = await onResetPassword(recEmail, recNewPassword);
        if (res.success) {
          setIdentifier(recEmail);
          setLoginPassword('');
          setLoginSuccessMessage('Senha atualizada com sucesso! Entre agora com sua nova senha.');
          setTab('login');
          // Reset states
          setRecStep('request');
          setGeneratedCode(null);
          setCodeExpiresAt(null);
          setEnteredCode('');
          setRecNewPassword('');
          setRecConfirmPassword('');
        } else {
          setRecError(res.message);
        }
      } else {
        setIdentifier(recEmail);
        setLoginSuccessMessage('Nova senha configurada com sucesso! Faça login.');
        setTab('login');
        setRecStep('request');
      }
    } catch {
      setRecError('Erro ao salvar nova senha. Tente novamente ou entre em contato com o suporte.');
    } finally {
      setIsSubmittingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        {/* Botão Fechar (apenas se não for tela inicial obrigatória) */}
        {!isFullScreen && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xl font-extrabold text-blue-600 mb-1">
            <Building2 className="w-6 h-6" />
            <span>GestãoSaaS</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Gestão Empresarial Multi-Tenant com controle por perfis
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            onClick={() => { setTab('login'); setLoginError(''); }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'login' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Acessar Conta
          </button>
          <button
            onClick={() => { setTab('register'); setRegErrorMessage(''); setLoginSuccessMessage(''); }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'register' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cadastrar Empresa
          </button>
          <button
            onClick={() => { 
              setTab('recover'); 
              setRecError(''); 
              setRecSuccess(''); 
              setLoginSuccessMessage(''); 
              setRecStep('request');
            }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'recover' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recuperar Senha
          </button>
        </div>

        {/* TAB 1: LOGIN (E-mail ou CNPJ) */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginSuccessMessage && (
              <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-emerald-800">Empresa Cadastrada com Sucesso!</strong>
                  <span>{loginSuccessMessage}</span>
                  <span className="block mt-1 text-[11px] text-emerald-700 font-semibold">
                    Digite sua senha abaixo para entrar no sistema.
                  </span>
                </div>
              </div>
            )}

            {loginError && (
              <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail de Usuário ou CNPJ da Empresa *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: seuemail@empresa.com.br ou 12.345.678/0001-90"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs pl-3.5 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Você pode digitar seu e-mail cadastrado ou o CNPJ da sua empresa.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Senha de Acesso *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Entrar no Sistema
            </button>

            <div className="flex flex-col gap-2 pt-2 text-center">
              <button
                type="button"
                onClick={() => { 
                  setTab('recover'); 
                  setRecError(''); 
                  setRecSuccess(''); 
                  setEnteredCode('');
                }}
                className="text-xs text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Esqueceu sua senha? <span className="font-semibold text-blue-600 underline">Recuperar com código de 15 minutos</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setLoginSuccessMessage(''); setRegErrorMessage(''); }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Ainda não tem cadastro? Clique para Cadastrar sua Empresa
              </button>
            </div>

            {/* Suporte Direto no Login */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <LifeBuoy className="w-3.5 h-3.5 text-blue-500" />
                Suporte Oficial:
              </span>
              <div className="flex items-center gap-2">
                <a 
                  href={getMailtoLink('Problema no Login')}
                  className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  {SUPPORT_EMAIL}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={handleCopySupportEmail}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                  title="Copiar e-mail de suporte"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: CADASTRO DE EMPRESA */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {regErrorMessage && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium">
                {regErrorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-0.5">Razão Social *</label>
              <input
                type="text"
                required
                placeholder="Ex: Alfa Logística e Transportes LTDA"
                value={regRazao}
                onChange={(e) => setRegRazao(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">CNPJ *</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={regCnpj}
                  onChange={(e) => setRegCnpj(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Nome Fantasia</label>
                <input
                  type="text"
                  placeholder="Ex: Alfa Express"
                  value={regFantasia}
                  onChange={(e) => setRegFantasia(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Nome do Dono / Diretor *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={regNomeDono}
                  onChange={(e) => setRegNomeDono(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={regTelefone}
                  onChange={(e) => setRegTelefone(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">E-mail Comercial *</label>
                <input
                  type="email"
                  required
                  placeholder="contato@empresa.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Senha Inicial *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 dígitos"
                  value={regSenha}
                  onChange={(e) => setRegSenha(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800">
              ⚡ <strong>Acesso Imediato:</strong> Sua empresa e seu usuário administrador serão cadastrados e liberados instantaneamente para login.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Cadastrar Empresa e Ativar Conta
            </button>
          </form>
        )}

        {/* TAB 3: RECUPERAR SENHA COM CÓDIGO SMS / E-MAIL (15 MINUTOS) */}
        {tab === 'recover' && (
          <div className="space-y-4">
            {/* Mensagem de Erro Geral */}
            {recError && (
              <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{recError}</span>
                </div>
              </div>
            )}

            {/* Mensagem de Sucesso Geral */}
            {recSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{recSuccess}</span>
                </div>
              </div>
            )}

            {/* PASSO 1: Solicitar Código */}
            {recStep === 'request' && (
              <form onSubmit={handleRecoverSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Cadastrado ou CNPJ da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="seuemail@empresa.com ou 00.000.000/0001-00"
                    value={recEmail}
                    onChange={(e) => setRecEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    O sistema despachará um código de 6 dígitos para o e-mail cadastrado.
                  </span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-800">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Regra de Segurança: Validade de 15 Minutos</span>
                  </div>
                  <p className="text-[11px] text-blue-800/80">
                    O código numérico gerado expira em exatamente <strong>15 minutos</strong>. Caso o código expire ou falhe, você poderá gerar um novo código ou entrar em contato direto com nosso suporte.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Código de Recuperação (15 Minutos)</span>
                </button>
              </form>
            )}

            {/* PASSO 2: Validar Código de 6 Dígitos */}
            {recStep === 'verify' && (
              <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
                {/* Header com Temporizador e Botão Voltar */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setRecStep('request'); setRecError(''); }}
                    className="text-[11px] text-slate-500 hover:text-blue-600 font-medium underline"
                  >
                    ← Alterar E-mail
                  </button>

                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    secondsLeft > 180 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : secondsLeft > 0 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {secondsLeft > 0 
                        ? `Expira em: ${formatTimer(secondsLeft)}` 
                        : 'EXPIRADO (15 min)'}
                    </span>
                  </div>
                </div>

                {generatedCode && (
                  <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center">
                      <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Código enviado para: {recEmail}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500">O código real é enviado pelo Supabase e é válido por até 15 minutos.</p>
                  </div>
                )}

                {/* Campo para Digitar os 6 dígitos */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                    Digite o Código de 6 Dígitos *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    className="w-full text-center font-mono text-xl font-bold tracking-[0.4em] py-2.5 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800"
                    autoFocus
                  />
                  <span className="text-[11px] text-slate-400 text-center block mt-1">
                    Insira os 6 números recebidos no e-mail.
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reenviar (15 min)</span>
                  </button>

                  <button
                    type="submit"
                    disabled={secondsLeft <= 0}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Validar Código</span>
                  </button>
                </div>
              </form>
            )}

            {/* PASSO 3: Definir Nova Senha */}
            {recStep === 'new_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Código de segurança confirmado! Cadastre sua nova senha de acesso.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Senha *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={recNewPassword}
                    onChange={(e) => setRecNewPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Nova Senha *</label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    value={recConfirmPassword}
                    onChange={(e) => setRecConfirmPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReset}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingReset ? 'Salvando...' : 'Salvar Nova Senha e Conectar'}</span>
                </button>
              </form>
            )}

            {/* Suporte ao usuário */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-start gap-2">
                  <LifeBuoy className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">
                      Teve algum problema, o código falhou ou esqueceu a senha?
                    </h4>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      Fale diretamente com o meu suporte oficial pelo e-mail:
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-amber-200 rounded-lg p-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 truncate select-all">
                    {SUPPORT_EMAIL}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopySupportEmail}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                      title="Copiar e-mail"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEmail ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    <a
                      href={getMailtoLink('Problema com Código ou Senha')}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>Enviar E-mail</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
