# 📚 Sistema de Consultoria Jurídica

Sistema web moderno de consultoria jurídica com inteligência artificial, desenvolvido com React, TypeScript e Google Gemini AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)

## ✨ Características

- 🤖 **IA Integrada**: Utiliza Google Gemini AI para assistência jurídica inteligente
- 📊 **Dashboard Interativo**: Visualização de dados com gráficos e estatísticas
- 🎨 **Interface Moderna**: Design responsivo e intuitivo
- 🔒 **Seguro**: Autenticação com Supabase
- ⚡ **Performance**: Construído com Vite para desenvolvimento rápido

## 🚀 Tecnologias

- **Frontend**: React 19.2 + TypeScript
- **Build Tool**: Vite 6.2
- **IA**: Google Gemini AI
- **Backend**: Supabase
- **UI Components**: Lucide React
- **Gráficos**: Recharts

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Google AI Studio (para API Key do Gemini)
- Conta no Supabase (opcional, para backend)

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-seu-repositorio>
   cd consultoria-jurídica
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```bash
   cp .env.example .env.local
   ```
   
   Edite o arquivo `.env.local` e adicione sua chave de API:
   ```env
   GEMINI_API_KEY=sua_chave_api_aqui
   ```
   
   > 💡 **Como obter a chave de API do Gemini:**
   > 1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
   > 2. Faça login com sua conta Google
   > 3. Clique em "Create API Key"
   > 4. Copie a chave gerada

4. **Execute o projeto localmente**
   ```bash
   npm run dev
   ```
   
   O aplicativo estará disponível em `http://localhost:3000`

## 📦 Build para Produção

Para criar uma build de produção:

```bash
npm run build
```

Para visualizar a build localmente:

```bash
npm run preview
```

## 🌐 Deploy no Vercel

### Opção 1: Deploy via Interface Web

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "Add New Project"
4. Importe seu repositório do GitHub
5. Configure a variável de ambiente:
   - Nome: `GEMINI_API_KEY`
   - Valor: sua chave de API do Gemini
6. Clique em "Deploy"

### Opção 2: Deploy via CLI

1. **Instale o Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Faça login no Vercel**
   ```bash
   vercel login
   ```

3. **Deploy o projeto**
   ```bash
   vercel
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   vercel env add GEMINI_API_KEY
   ```

5. **Deploy para produção**
   ```bash
   vercel --prod
   ```

### Configuração de Variáveis de Ambiente no Vercel

Após o deploy, configure as variáveis de ambiente:

1. Acesse o dashboard do seu projeto no Vercel
2. Vá em "Settings" → "Environment Variables"
3. Adicione:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: sua chave de API do Gemini
   - **Environment**: Production, Preview, Development
4. Clique em "Save"
5. Faça um novo deploy para aplicar as mudanças

## 📁 Estrutura do Projeto

```
consultoria-jurídica/
├── components/          # Componentes React
├── hooks/              # Custom React Hooks
├── services/           # Serviços (API, DB)
├── types.ts            # Definições TypeScript
├── App.tsx             # Componente principal
├── index.tsx           # Ponto de entrada
├── index.html          # Template HTML
├── vite.config.ts      # Configuração do Vite
└── vercel.json         # Configuração do Vercel
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Visualiza a build de produção localmente
- `npm run lint` - Verifica erros de TypeScript

## 🐛 Troubleshooting

### Erro: "vite não é reconhecido"
Execute `npm install` para instalar as dependências.

### Erro de API Key
Verifique se a variável `GEMINI_API_KEY` está configurada corretamente no `.env.local` (local) ou nas configurações do Vercel (produção).

### Build falha no Vercel
1. Verifique se todas as dependências estão no `package.json`
2. Confirme que a variável de ambiente está configurada
3. Verifique os logs de build no dashboard do Vercel

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório.

---

Desenvolvido com ❤️ usando React e Google Gemini AI
