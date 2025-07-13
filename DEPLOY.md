# 🚀 Deploy Automático - GitHub Pages

Este projeto está configurado para deploy automático usando GitHub Actions. **Não é necessário fazer build manualmente!**

## ⚠️ PRIMEIRO: Configure o GitHub Pages

**IMPORTANTE**: Antes do primeiro push, você DEVE habilitar o GitHub Pages no repositório:

### 1. Habilitar GitHub Pages

1. **Acesse seu repositório no GitHub**
2. **Vá para `Settings` → `Pages`**
3. **Em "Source", selecione: `GitHub Actions`** (não "Deploy from a branch")
4. **Clique em "Save"**

> ✅ **Esta configuração só precisa ser feita uma vez!**

### 2. Verificar Permissões

O workflow já está configurado com as permissões corretas:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## 🔄 Como Usar

Após habilitar o GitHub Pages:

### Fazer Deploy

1. **Edite os arquivos** em `src/` (não edite `dist/`)
2. **Commit e push** para a branch `main`:
   ```bash
   git add .
   git commit -m "Suas alterações"
   git push origin main
   ```

### O que acontece automaticamente

1. ✅ **GitHub Actions detecta** o push na branch `main`
2. ✅ **Instala dependências** (`npm ci`)
3. ✅ **Executa o build** (`npm run build`)
4. ✅ **Gera `main.js`** otimizado com CSS/HTML embutidos
5. ✅ **Cria `index.html`** para navegação no GitHub Pages
6. ✅ **Faz deploy** para `https://USERNAME.github.io/REPO`

## � Solução de Problemas

### Erro: "Get Pages site failed"

**Causa**: GitHub Pages não está habilitado ou configurado incorretamente.

**Solução**:
1. Vá para `Settings` → `Pages` no seu repositório
2. Certifique-se que "Source" está como "GitHub Actions"
3. Se estiver como "Deploy from a branch", mude para "GitHub Actions"
4. Salve e refaça o push

### Erro: "Not Found" no deploy

**Causa**: Repository não tem Pages habilitado.

**Solução**:
1. Siga os passos da seção "1. Habilitar GitHub Pages" acima
2. Aguarde alguns minutos após salvar
3. Faça um novo push para reexecutar o workflow

## 📋 Checklist Final

Antes de fazer o primeiro push:

- [ ] ✅ GitHub Pages habilitado em `Settings` → `Pages`
- [ ] ✅ Source configurado como "GitHub Actions"
- [ ] ✅ Configurações salvas
- [ ] ✅ Pronto para push!
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
