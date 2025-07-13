# 🚀 Instruções para Habilitar GitHub Pages

## ⚠️ IMPORTANTE: Habilite o GitHub Pages ANTES de fazer push

### Passos para configurar GitHub Pages:

1. **Vá para as Configurações do Repositório**:
   - No GitHub, acesse seu repositório
   - Clique em **Settings** (Configurações)

2. **Navegue até Pages**:
   - No menu lateral esquerdo, procure por **Pages**
   - Clique em **Pages**

3. **Configure a Fonte**:
   - Em **Source** (Fonte), selecione: **GitHub Actions**
   - **NÃO** selecione "Deploy from a branch"

4. **Salve as Configurações**:
   - Clique em **Save** (Salvar)

5. **Faça o Push**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

6. **Aguarde o Deploy**:
   - Vá para a aba **Actions** no GitHub
   - Aguarde o workflow "Build and Deploy to GitHub Pages" terminar
   - Seu módulo estará disponível em: `https://SEU_USUARIO.github.io/SEU_REPO/main.js`

## 🔧 Se der erro "Pages not enabled":

1. Certifique-se de que seguiu todos os passos acima
2. Aguarde alguns minutos após habilitar o Pages
3. Tente fazer um novo push:
   ```bash
   git commit --allow-empty -m "Trigger Pages deploy"
   git push origin main
   ```

## 📞 URL Final:

Após o deploy, use:
```html
<script type="module" src="https://SEU_USUARIO.github.io/SEU_REPO/main.js?key=SUA_CHAVE"></script>
```

Substitua:
- `SEU_USUARIO` pelo seu nome de usuário do GitHub
- `SEU_REPO` pelo nome do repositório
- `SUA_CHAVE` pela sua chave de licença
