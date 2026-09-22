# GestãoSaaS — Pré-lançamento

> **Status:** versão de pré-lançamento para validação, testes e preparação da
> publicação oficial.

## Downloads de pré-lançamento

Use as tags abaixo para baixar diretamente o pacote de cada plataforma:

| Plataforma | Download |
| --- | --- |
| Windows / PC | [**BAIXAR WINDOWS**](https://github.com/suportesaasgestao-web/gestao-saas-app/releases/download/v0.1.4/GestaoSaaS.Setup.0.1.0.exe) |
| Android APK | [**BAIXAR ANDROID**](https://github.com/suportesaasgestao-web/gestao-saas-app/releases/download/v0.1.4/app-debug.apk) |
| Linux | [**BAIXAR LINUX**](https://github.com/suportesaasgestao-web/gestao-saas-app/releases/download/v0.1.4/GestaoSaaS-0.1.0.AppImage) |
| macOS | Em preparação |

Os links de download são arquivos públicos da Release `v0.1.4`; não exigem
acesso aos Artifacts do GitHub. O pacote macOS será disponibilizado após a
correção da compilação específica para macOS.

Sistema de gestão empresarial multiempresa para cadastro de organizações,
produtos, estoque, colaboradores e chamados de suporte. A interface é
responsiva e pode ser executada como PWA, aplicativo Android via Capacitor e
aplicativo desktop via Electron.

## Segurança e administração

Credenciais de administradores **não são distribuídas neste repositório**, não
aparecem na tela de login e não ficam embutidas no bundle do cliente. Provisione
os administradores somente no ambiente seguro da implantação e nunca publique
senhas ou tokens.

O projeto não inclui “acesso direto” para administradores. Usuários e clientes
visualizam apenas o fluxo normal de autenticação; autorizações administrativas
devem ser verificadas no backend/provedor de identidade, nunca apenas no
frontend.

Administradores podem ser identificados pela tag visual `ADMIN`. Essa tag é
derivada do campo de perfil no banco de dados e não representa senha, código ou
atalho de login.

## Requisitos

- Node.js 20+ e npm (ou Bun)
- Android Studio e JDK 17 para gerar o APK
- Xcode em macOS para gerar o aplicativo macOS/iOS
- Electron Builder para os instaladores desktop
## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha somente as variáveis
   necessárias para o ambiente de desenvolvimento.

3. Antes de publicar, configure o provedor de autenticação, o banco de dados,
   as políticas de acesso e o serviço de e-mail no ambiente oficial.

## Execução e validação

```bash
npm run dev
npm run lint
npm run build
```

## Pacotes multiplataforma

O workflow **Build GestãoSaaS** em `.github/workflows/release.yml` gera
automaticamente os pacotes para Windows/PC, Linux, macOS e Android. Execute-o
manualmente na aba **Actions** ou crie uma tag no formato `v0.1.0` para gerar
uma release pública com os arquivos para download.

### Android APK

```bash
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

O APK de depuração é gerado em
`android/app/build/outputs/apk/debug/app-debug.apk`. Para distribuição,
configure uma chave de assinatura própria e execute `assembleRelease`.

### Windows, Linux e macOS

```bash
npm run build
npx electron-builder --win --linux --mac
```

O alvo macOS só pode ser assinado e empacotado em um host macOS. Os artefatos
desktop ficam em `release/` quando o empacotamento termina.

Para testar localmente no Windows:

```bash
npm run package:win
```

Os comandos `npm run package:linux`, `npm run package:mac` e
`npm run package:all` também estão disponíveis. O macOS deve ser compilado em
um runner ou computador macOS; o workflow já usa `macos-latest`.

### PWA

```bash
npm run build
npm run preview
```

Em navegadores compatíveis, o PWA pode ser instalado no Windows, Linux, macOS,
Android e ChromeOS.

## Documentos legais

- [Licença MIT](LICENSE)
- [Política de Privacidade](PRIVACY_POLICY.md)

Os documentos são modelos técnicos e devem ser revisados pelo responsável
legal pela implantação, especialmente quanto à LGPD, retenção, base legal,
subprocessadores e canal de atendimento.

## Estrutura

- `src/`: aplicação React/TypeScript
- `android/`: projeto Capacitor Android
- `electron/`: processo principal desktop
- `php_saas/`: backend PHP legado opcional
- `release/`: artefatos gerados, quando presentes

## Licença

Distribuído sob a licença MIT. Consulte `LICENSE`.
