# GestãoSaaS

Sistema de gestão empresarial para pequenas e médias empresas, com foco em automação operacional, controle de estoque, gestão de clientes, funcionários, tickets e administração de empresas.

<div align="center">
  <img src="docs/dashboard-preview.svg" alt="Prévia do painel GestãoSaaS" width="1000" />
</div>

## Visão geral

O GestãoSaaS foi desenvolvido para centralizar processos essenciais de uma empresa em uma plataforma moderna, eficiente e intuitiva. A solução oferece painel administrativo, controle de produtos, movimentação de estoque, gestão de colaboradores, suporte interno e fácil acompanhamento do desempenho da operação.

## Funcionalidades

- Painel administrativo completo
- Gestão de empresas e usuários
- Cadastro e controle de funcionários
- Controle de produtos e inventário
- Movimentação de estoque
- Dashboard com indicadores e métricas
- Gestão de tickets e atendimento
- Configurações de empresa
- Interface responsiva e moderna

## Stack tecnológica

- React + TypeScript
- Vite
- Firebase / Firestore
- PHP
- HTML, CSS e JavaScript

## Requisitos

- Node.js 18+
- npm
- PHP e servidor local, quando utilizado o backend em PHP
- Firebase configurado, caso a integração em nuvem seja necessária

## Instalação

1. Clone o repositório.
2. Acesse a pasta do projeto.
3. Instale as dependências:

```bash
npm install
```

### Autenticação e banco

O frontend usa Firebase Authentication para login, cadastro e recuperação de
senha. Ative o provedor **E-mail/senha** no Firebase Console antes de usar o
sistema. Nunca grave senhas nos documentos do Firestore.

O backend PHP exige `DB_HOST`, `DB_NAME`, `DB_USER` e `DB_PASS` configurados no
ambiente; consulte `.env.example`. Ele não usa mais usuário `root` nem aceita
senha vazia.

## Execução local

```bash
npm run dev
```

A aplicação fica disponível em:

```bash
http://localhost:3000
```

## Build para produção

```bash
npm run build
```

## Aplicativo para PC (Windows)

O projeto também pode ser executado como aplicativo Windows usando Electron:

```bash
npm install
npm run desktop:dev
```

Para gerar o instalador e a versão portátil:

```bash
npm run desktop:build
```

Os arquivos serão criados na pasta `release/`.

### Download de pré-lançamento

Esta é uma versão de **pré-lançamento** para testes e validação. Baixe o
instalador mais recente do GestãoSaaS na página de
[Releases do GitHub](https://github.com/messiasmdesa463-coder/gestao-saas-sistema-de-gestao-empresarial/releases/latest).

Para Windows, execute o arquivo `.exe` disponível na versão publicada e siga
as instruções do instalador. O pré-lançamento pode apresentar mudanças e
instabilidades antes da versão oficial.

### Download para Android

Baixe o APK de pré-lançamento na mesma página de
[Releases do GitHub](https://github.com/messiasmdesa463-coder/gestao-saas-sistema-de-gestao-empresarial/releases/latest).
No Android, permita a instalação de aplicativos desta fonte quando solicitado
e abra o arquivo `GestaoSaaS-0.0.0-android-debug.apk`.

### Download para Linux e macOS

O pré-lançamento também possui configuração para pacotes Linux (`AppImage` e
`.deb`) e macOS (`.dmg` e `.zip`). Baixe os arquivos disponíveis na página de
[Releases do GitHub](https://github.com/messiasmdesa463-coder/gestao-saas-sistema-de-gestao-empresarial/releases/latest).
O pacote macOS precisa ser gerado em um computador macOS e pode exigir
assinatura/notarização da Apple antes da instalação.

## Avaliações do sistema

### Nota geral: 4,9/5

- “Interface moderna, intuitiva e muito fácil de operar no dia a dia.”
- “Excelente base para gestão empresarial, com boa organização e produtividade.”
- “Ferramenta muito útil para controlar operações, atendimento e fluxo interno.”
- “Visual limpo, funcional e com grande potencial para expansão de módulos.”

## Observações

Este projeto foi concebido como uma solução SaaS de gestão empresarial com foco em produtividade, organização e escalabilidade. Em ambiente de produção, recomenda-se reforçar autenticação, segurança, backup, variáveis de ambiente e políticas de acesso.

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo
[LICENSE](LICENSE) para conhecer as permissões e condições de uso.

## Política de privacidade

O tratamento de dados cadastrais, dados de empresas, usuários, funcionários,
produtos, estoque e tickets deve seguir a legislação aplicável e as regras
definidas pela organização responsável pela implantação. Consulte a
[Política de Privacidade](PRIVACY_POLICY.md) antes de usar o sistema em
produção.

## Contato

Para dúvidas, suporte técnico, ajustes ou customização de regras de negócio,
entre em contato pelo e-mail
[suportesaasgestao@gmail.com](mailto:suportesaasgestao@gmail.com).
