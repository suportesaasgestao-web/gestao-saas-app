-- ==========================================================
-- GESTÃOSAAS - SISTEMA DE GESTÃO EMPRESARIAL MULTI-TENANT
-- Banco de dados MySQL compatível com PHP 8.x e PDO
-- ==========================================================

CREATE DATABASE IF NOT EXISTS gestao_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestao_saas;

-- 1. TABELA DE EMPRESAS (TENANTS)
CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(30) NULL,
    endereco VARCHAR(255) NULL,
    cidade VARCHAR(100) NULL,
    estado VARCHAR(2) NULL,
    status ENUM('pendente', 'aprovada', 'rejeitada', 'suspensa') DEFAULT 'pendente',
    logo_url VARCHAR(255) NULL,
    banner_url VARCHAR(255) NULL,
    cor_tema VARCHAR(20) DEFAULT '#2563eb',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cnpj (cnpj),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NULL,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'dono', 'gerente', 'funcionario') NOT NULL DEFAULT 'funcionario',
    cargo VARCHAR(100) NULL,
    departamento VARCHAR(100) NULL,
    ativo TINYINT(1) DEFAULT 1,
    ultimo_acesso DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_perfil (perfil),
    INDEX idx_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    sku VARCHAR(60) NOT NULL,
    codigo_barras VARCHAR(100) NULL,
    categoria VARCHAR(100) NOT NULL DEFAULT 'Geral',
    preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estoque_atual INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 5,
    unidade_medida VARCHAR(10) DEFAULT 'UN',
    localizacao VARCHAR(100) NULL,
    foto_url VARCHAR(255) NULL,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY uq_empresa_sku (empresa_id, sku),
    INDEX idx_empresa_prod (empresa_id),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABELA DE MOVIMENTAÇÕES DE ESTOQUE
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    produto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo ENUM('entrada', 'saida', 'ajuste', 'devolucao') NOT NULL,
    quantidade INT NOT NULL,
    saldo_anterior INT NOT NULL,
    saldo_posterior INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    documento_ref VARCHAR(100) NULL,
    valor_unitario DECIMAL(10,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_empresa_mov (empresa_id),
    INDEX idx_produto_mov (produto_id),
    INDEX idx_data_mov (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABELA DE TICKETS DE ATENDIMENTO
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    categoria ENUM('suporte', 'financeiro', 'duvida', 'sugestao', 'urgente') DEFAULT 'suporte',
    prioridade ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media',
    status ENUM('aberto', 'em_atendimento', 'resolvido', 'fechado') DEFAULT 'aberto',
    descricao TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_empresa_ticket (empresa_id),
    INDEX idx_status_ticket (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. TABELA DE MENSAGENS DO TICKET
CREATE TABLE IF NOT EXISTS ticket_mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    usuario_id INT NOT NULL,
    mensagem TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TABELA DE DOCUMENTOS E ANEXOS
CREATE TABLE IF NOT EXISTS documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    ticket_id INT NULL,
    nome_original VARCHAR(255) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho VARCHAR(255) NOT NULL,
    tamanho INT NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. TABELA DE TOKENS DE RECUPERAÇÃO DE SENHA
CREATE TABLE IF NOT EXISTS tokens_recuperacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    token VARCHAR(64) NOT NULL,
    expira_em DATETIME NOT NULL,
    usado TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_email_rec (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. TABELA DE CONFIGURAÇÕES GERAIS
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NULL,
    chave VARCHAR(100) NOT NULL,
    valor TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_empresa_chave (empresa_id, chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Não há credenciais padrão. Configure o primeiro administrador no ambiente
-- da implantação após criar a estrutura do banco.
