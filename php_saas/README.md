# GestãoSaaS - Sistema de Gestão Empresarial Multi-Tenant (PHP 8.x + MySQL)

Sistema completo de gestão empresarial desenvolvido em arquitetura modular PHP puro com PDO, banco de dados MySQL e front-end desacoplado (HTML5, CSS3, Vanilla JS).

## 🚀 Requisitos
- PHP 8.0 ou superior (com extensões `pdo`, `pdo_mysql`, `mbstring`, `session`)
- MySQL 5.7+ ou MariaDB 10.3+
- Servidor Web (Apache com `mod_rewrite` habilitado, Nginx ou PHP Built-in Server)

## 📦 Estrutura de Diretórios
```text
php_saas/
├── config/
│   ├── Database.php          # Conexão Singleton PDO + auto-criação de BD e tabelas
│   └── Session.php           # Sessões seguras e controle de papéis (RBAC)
├── database/
│   └── schema.sql            # Script DDL completo com tabelas, índices e triggers
├── modules/
│   ├── auth/
│   │   ├── login.php         # Login com E-mail ou CNPJ e verificação de aprovação
│   │   ├── register_company.php # Cadastro de empresa (nasce pendente) + Dono
│   │   ├── recover_password.php # Geração de token e redefinição de senha
│   │   └── logout.php        # Encerramento de sessão
│   ├── admin/
│   │   └── companies.php     # Aprovação / rejeição / suspensão de empresas
│   ├── products/
│   │   └── products.php      # CRUD de produtos com SKU, categorias e estoque
│   ├── stock/
│   │   └── movements.php     # Entradas, saídas e ajustes de estoque (transações ACID)
│   ├── employees/
│   │   └── employees.php     # Gestão de equipe (dono, gerente, funcionário)
│   ├── tickets/
│   │   └── tickets.php       # Central de suporte com prioridades e respostas
│   ├── dashboard/
│   │   └── stats.php         # Indicadores analíticos para o painel
│   └── settings/
│       └── company.php       # Logotipo, banner, cores e dados cadastrais
├── assets/
│   ├── css/style.css         # Folha de estilos moderna e responsiva
│   └── js/app.js             # Requisições AJAX com Fetch API
├── index.php                 # Roteador inicial
├── login.php                 # Página de login, cadastro e recuperação
└── painel.php                # Interface principal do sistema
```

## 🛠️ Instalação e Configuração

1. **Configuração de Variáveis de Ambiente:**
Defina as variáveis no seu servidor ou crie um arquivo `.env`:
```env
DB_HOST=localhost
DB_NAME=gestao_saas
DB_USER=root
DB_PASS=
```

2. **Criação Automática do Banco de Dados:**
Ao acessar o sistema pela primeira vez, a classe `Config\Database::getConnection()` executará automaticamente o comando `CREATE DATABASE IF NOT EXISTS gestao_saas` e carregará o script `database/schema.sql`.

Se preferir importar manualmente via terminal:
```bash
mysql -u root -p < database/schema.sql
```

3. **Executando com o servidor embutido do PHP:**
```bash
cd php_saas
php -S localhost:8000
```
Abra o navegador em `http://localhost:8000`.

## 👤 Credenciais Padrão de Demonstração
- **Super Administrador (SaaS Global):**
  - E-mail: `admin@saas.com.br`
  - Senha: `Admin@123`
  - *Função:* Aprovar empresas pendentes, monitorar tenants.

- **Dono de Empresa (Tenant):**
  - Cadastre sua empresa na aba "Cadastrar Empresa" da tela de login.
  - Faça login como admin e aprove a empresa cadastrada.
  - Acesse com o e-mail ou CNPJ cadastrado.
