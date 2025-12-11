# 🚀 Guia de Deploy no Vercel

Este guia fornece instruções detalhadas para fazer o deploy da aplicação de Consultoria Jurídica no Vercel.

## 📋 Pré-requisitos

- [ ] Conta no GitHub
- [ ] Conta no Vercel (pode usar login do GitHub)
- [ ] Chave de API do Google Gemini ([obter aqui](https://aistudio.google.com/app/apikey))
- [ ] Código do projeto no GitHub

## 🌐 Método 1: Deploy via Interface Web (Recomendado)

### Passo 1: Preparar o Repositório no GitHub

1. **Crie um novo repositório no GitHub**
   - Acesse [github.com/new](https://github.com/new)
   - Nome sugerido: `consultoria-juridica`
   - Escolha: Privado ou Público
   - **NÃO** inicialize com README (já temos um)

2. **Envie o código para o GitHub**
   ```bash
   # Na pasta do projeto
   git init
   git add .
   git commit -m "Initial commit: Sistema de Consultoria Jurídica"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/consultoria-juridica.git
   git push -u origin main
   ```

### Passo 2: Conectar ao Vercel

1. **Acesse o Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Clique em "Sign Up" ou "Login"
   - Escolha "Continue with GitHub"

2. **Importe o Projeto**
   - No dashboard, clique em "Add New..."
   - Selecione "Project"
   - Encontre seu repositório `consultoria-juridica`
   - Clique em "Import"

### Passo 3: Configurar o Projeto

1. **Configurações de Build** (geralmente detectadas automaticamente)
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Variáveis de Ambiente** ⚠️ **IMPORTANTE**
   - Clique em "Environment Variables"
   - Adicione:
     ```
     Name: GEMINI_API_KEY
     Value: [sua-chave-api-do-gemini]
     ```
   - Selecione todos os ambientes: Production, Preview, Development
   - Clique em "Add"

3. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build (1-3 minutos)
   - ✅ Seu app estará no ar!

### Passo 4: Acessar o App

Após o deploy bem-sucedido:
- URL de produção: `https://seu-projeto.vercel.app`
- O Vercel fornecerá automaticamente um domínio
- Você pode configurar um domínio customizado depois

## 💻 Método 2: Deploy via CLI

### Instalação do Vercel CLI

```bash
npm install -g vercel
```

### Login no Vercel

```bash
vercel login
```

### Deploy do Projeto

1. **Primeiro Deploy (Preview)**
   ```bash
   vercel
   ```
   
   Durante o processo, responda:
   - Set up and deploy? `Y`
   - Which scope? Escolha sua conta
   - Link to existing project? `N`
   - Project name: `consultoria-juridica`
   - In which directory is your code? `./`
   - Want to override settings? `N`

2. **Adicionar Variável de Ambiente**
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   
   - Escolha: Production, Preview, Development
   - Cole sua chave de API do Gemini

3. **Deploy para Produção**
   ```bash
   vercel --prod
   ```

## 🔄 Atualizações Futuras

### Deploy Automático (Recomendado)

Após a configuração inicial, o Vercel fará deploy automático:
- **Push para `main`**: Deploy em produção
- **Push para outras branches**: Deploy de preview
- **Pull Requests**: Deploy de preview com URL única

### Deploy Manual

Se preferir controle manual:

```bash
# Deploy de preview
vercel

# Deploy de produção
vercel --prod
```

## ⚙️ Configurações Avançadas

### Domínio Customizado

1. Acesse o projeto no Vercel Dashboard
2. Vá em "Settings" → "Domains"
3. Adicione seu domínio
4. Configure os DNS conforme instruções

### Variáveis de Ambiente Adicionais

Se precisar adicionar mais variáveis:

**Via Dashboard:**
1. Projeto → Settings → Environment Variables
2. Add New → Nome e Valor
3. Selecione os ambientes
4. Save

**Via CLI:**
```bash
vercel env add NOME_DA_VARIAVEL
```

### Configurar Redirects/Rewrites

Edite o arquivo `vercel.json` na raiz do projeto (já configurado).

## 🐛 Troubleshooting

### ❌ Build Falha

**Erro: "Cannot find module"**
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente para testar

**Erro: "GEMINI_API_KEY is not defined"**
- Confirme que a variável está configurada no Vercel
- Verifique se selecionou o ambiente correto (Production)

### ❌ App não Carrega

**Página em branco:**
1. Abra o Console do navegador (F12)
2. Verifique erros de API
3. Confirme que a chave do Gemini está válida

**Erro 404 em rotas:**
- O `vercel.json` deve ter a configuração de rewrites (já incluído)

### ❌ Variáveis de Ambiente não Funcionam

1. Vá em Settings → Environment Variables
2. Verifique se a variável existe
3. Confirme que está no ambiente correto
4. Faça um novo deploy: Settings → Deployments → Redeploy

## 📊 Monitoramento

### Ver Logs

**Via Dashboard:**
- Projeto → Deployments → Selecione um deploy → Logs

**Via CLI:**
```bash
vercel logs [deployment-url]
```

### Analytics

O Vercel fornece analytics gratuito:
- Projeto → Analytics
- Veja pageviews, performance, etc.

## 🔒 Segurança

### Proteger Variáveis de Ambiente

- ✅ Nunca commite arquivos `.env.local`
- ✅ Use apenas o dashboard/CLI do Vercel
- ✅ Rotacione chaves de API periodicamente

### HTTPS

- ✅ Automático em todos os deploys do Vercel
- ✅ Certificados SSL gratuitos

## 📞 Suporte

- [Documentação Vercel](https://vercel.com/docs)
- [Comunidade Vercel](https://github.com/vercel/vercel/discussions)
- [Status do Vercel](https://vercel-status.com)

---

✅ **Pronto!** Seu app de Consultoria Jurídica está no ar! 🎉
