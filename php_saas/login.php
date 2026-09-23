<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GestãoSaaS - Login & Cadastro Empresarial</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body class="auth-body">
    <div class="auth-container">
        <div class="auth-header">
            <div class="auth-logo">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 11h2M13 11h2M9 15h2M13 15h2"/>
                </svg>
                <span>GestãoSaaS</span>
            </div>
            <p>Plataforma de Gestão Integrada para Pequenas e Médias Empresas</p>
        </div>

        <div class="auth-tabs">
            <button class="tab-btn active" onclick="switchAuthTab('login')">Acessar Conta</button>
            <button class="tab-btn" onclick="switchAuthTab('register')">Cadastrar Empresa</button>
            <button class="tab-btn" onclick="switchAuthTab('recover')">Esqueci Senha</button>
        </div>

        <div id="alertBox" class="alert-box d-none"></div>

        <!-- TAB 1: LOGIN -->
        <form id="formLogin" class="auth-form" onsubmit="handleLogin(event)">
            <div class="form-group">
                <label for="loginIdentifier">E-mail ou CNPJ</label>
                <input type="text" id="loginIdentifier" placeholder="seu@email.com ou 00.000.000/0001-00" required>
            </div>
            <div class="form-group">
                <label for="loginSenha">Senha</label>
                <input type="password" id="loginSenha" placeholder="Digite sua senha" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Entrar no Painel</button>
            
            <div class="auth-help-box">
                <strong>Credenciais de Demonstração:</strong><br>
                <span>Admin SaaS:</span> admin@saas.com.br | Admin@123<br>
                <span>Dono Empresa:</span> dono@empresa.com.br ou CNPJ | Dono@123
            </div>
        </form>

        <!-- TAB 2: CADASTRO DE EMPRESA -->
        <form id="formRegister" class="auth-form d-none" onsubmit="handleRegister(event)">
            <div class="form-group">
                <label for="regRazao">Razão Social *</label>
                <input type="text" id="regRazao" placeholder="Ex: Alfa Logística e Comércio LTDA" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="regCnpj">CNPJ *</label>
                    <input type="text" id="regCnpj" placeholder="00.000.000/0001-00" required>
                </div>
                <div class="form-group">
                    <label for="regFantasia">Nome Fantasia</label>
                    <input type="text" id="regFantasia" placeholder="Ex: Alfa Express">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="regDono">Nome do Proprietário *</label>
                    <input type="text" id="regDono" placeholder="Nome completo" required>
                </div>
                <div class="form-group">
                    <label for="regEmail">E-mail do Dono *</label>
                    <input type="email" id="regEmail" placeholder="contato@empresa.com" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="regTelefone">Telefone / WhatsApp</label>
                    <input type="text" id="regTelefone" placeholder="(11) 98765-4321">
                </div>
                <div class="form-group">
                    <label for="regSenha">Senha de Acesso *</label>
                    <input type="password" id="regSenha" placeholder="Mínimo 6 dígitos" required>
                </div>
            </div>
            <button type="submit" class="btn btn-success btn-block">Enviar Cadastro para Aprovação</button>
        </form>

        <!-- TAB 3: RECUPERAR SENHA -->
        <form id="formRecover" class="auth-form d-none" onsubmit="handleRecover(event)">
            <div class="form-group">
                <label for="recEmail">Seu E-mail Cadastrado</label>
                <input type="email" id="recEmail" placeholder="seu@email.com" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Gerar Token de Recuperação</button>
            <div id="simulatedMailBox" class="simulated-mail-box d-none"></div>
        </form>
    </div>

    <script src="/assets/js/app.js"></script>
</body>
</html>
