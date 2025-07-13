# 🚀 Deploy Automático - GitHub Pages

Este projeto está configurado para deploy automático usando GitHub Actions. **Não é necessário fazer build manualmente!**

## ⚠️ CONFIGURAÇÃO AUTOMÁTICA

**IMPORTANTE**: O GitHub Actions agora configura automaticamente o GitHub Pages! 

O workflow inclui:
```yaml
- name: Configure Pages
  uses: actions/configure-pages@v4
  with:
    enablement: true
```

### Como Usar

1. **Faça push** para a branch `main`
2. **GitHub Actions automaticamente**:
   - ✅ Configura o GitHub Pages
   - ✅ Instala dependências (`npm ci`)
   - ✅ Executa o build (`npm run build`)
   - ✅ Gera `main.js` otimizado com CSS/HTML embutidos
   - ✅ Cria `index.html` para navegação
   - ✅ Faz deploy para `https://Juevan.github.io/Zeev---SLA-Blocker`

### Fazer Deploy

```bash
git add .
git commit -m "Suas alterações"
git push origin main
```

## 🐛 Solução de Problemas

### Erro: "Get Pages site failed"

**Causa**: Primeira execução do workflow - Pages será configurado automaticamente.

**Solução**: 
1. ✅ O workflow vai configurar automaticamente na primeira execução
2. ✅ Aguarde a conclusão do workflow
3. ✅ Próximos pushes funcionarão normalmente

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
