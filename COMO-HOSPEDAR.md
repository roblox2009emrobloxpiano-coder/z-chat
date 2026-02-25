# Z-Chat - Como hospedar no Vercel (GRÁTIS)

## 🚀 Passo a Passo FÁCIL

### Passo 1: Baixar o projeto
- Baixe o arquivo `z-chat.zip`
- Descompacte em uma pasta no seu computador

### Passo 2: Criar repositório no GitHub
1. Acesse: https://github.com/new
2. Nome do repositório: `z-chat`
3. Deixe **Público**
4. Clique em **"Create repository"**

### Passo 3: Subir para o GitHub
**Opção A - Usando Git no terminal:**
```bash
cd z-chat
git init
git add .
git commit -m "Meu site Z-Chat"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/z-chat.git
git push -u origin main
```

**Opção B - Usando o site do GitHub:**
1. No repositório criado, clique em "uploading an existing file"
2. Arraste todos os arquivos da pasta descompactada
3. Clique em "Commit changes"

### Passo 4: Conectar ao Vercel
1. Acesse: https://vercel.com
2. Clique em **"Sign up"** → Escolha **"Continue with GitHub"**
3. Autorize o Vercel a acessar seu GitHub
4. Após criar conta, clique em **"Add New Project"**
5. Selecione o repositório `z-chat`
6. Clique em **"Deploy"**

### Passo 5: PRONTO! 🎉
- Seu site estará disponível em: `https://z-chat.vercel.app`
- Ou outro nome que você escolher

---

## ⚙️ Variáveis de Ambiente (Opcional)

Se precisar, adicione no Vercel:
- Vá em **Settings → Environment Variables**
- Adicione:

```
DATABASE_URL=file:./db.sqlite
```

---

## 📱 Funcionalidades do seu site:

✅ 8 personagens prontos para conversar
✅ Chat com IA real (usando Groq/LLM gratuito)
✅ Criar seus próprios personagens
✅ Mensagens ILIMITADAS
✅ 100% GRATUITO
✅ Sem restrições

---

## 🆘 Problemas?

**Site não carrega?**
- Espere 2-3 minutos após o deploy
- Verifique se o repositório está público

**Erro no banco de dados?**
- O SQLite está incluído no projeto
- Funciona automaticamente no Vercel

**Precisa de ajuda?**
- Documentação Vercel: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

Divirta-se com seu novo site! 🎉
