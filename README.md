# Zeev SLA Blocker

Um módulo ES (JavaScript Module) que exibe um modal com tarefas de correção pendentes quando certas condições de URL são atendidas.

## 🚀 Funcionalidades

- ✅ **Verificação de URL**: Só executa se a URL contiver `/my` e `/services` no caminho
- 🔐 **Sistema de Licenciamento**: Valida chaves de licença via API externa
- 🎨 **Modal Responsivo**: Interface moderna com Tailwind CSS
- 📱 **Responsivo**: Ocupa 70% da tela e se adapta a diferentes dispositivos
- 🛡️ **Overlay Bloqueante**: Impede interação com elementos da página até o fechamento
- ⚡ **Bundle Otimizado**: CSS e HTML embutidos no JavaScript final

## 📦 Como Usar

Adicione uma única linha no final do `<body>` da sua página HTML:

```html
<script type="module" src="https://USERNAME.github.io/REPO/main.js?key=SUA_CHAVE"></script>
```

### Parâmetros

- `key`: Sua chave de licença (obrigatório)

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/USERNAME/REPO.git
cd REPO

# Instale as dependências
npm install
```

### Build Local (Opcional)

```bash
# Build para testar localmente
npm run build

# Verificar arquivos gerados
ls dist/
```

### 🚀 Deploy Automático

**Não é necessário fazer build manualmente!** O GitHub Actions faz tudo automaticamente:

1. **Faça suas alterações** no código fonte (`src/`)
2. **Commit e push** para a branch `main`:
   ```bash
   git add .
   git commit -m "Suas alterações"
   git push origin main
   ```
3. **GitHub Actions automaticamente**:
   - ✅ Instala dependências
   - ✅ Executa o build
   - ✅ Gera `main.js` e `index.html`
   - ✅ Faz deploy no GitHub Pages

### Estrutura do Projeto

```
├── src/                 # 📝 Código fonte (edite aqui)
│   ├── main.ts          # Código principal TypeScript
│   ├── modal.html       # Template HTML do modal
│   └── styles.css       # Estilos base Tailwind
├── .github/workflows/   # 🤖 GitHub Actions
├── dist/               # 📦 Gerado automaticamente (não editar)
├── build.mjs           # Script de build personalizado
└── package.json
```

> **⚠️ Importante**: A pasta `dist/` é gerada automaticamente pelo GitHub Actions. Não faça commit dela!

## 🎯 Comportamento

1. **Verificação de URL**: O módulo verifica se `window.location.pathname` contém `/my` E `/services`
2. **Validação de Licença**: Faz uma requisição para `https://validador-web.vercel.app/validate-license?key=SUA_CHAVE`
3. **Exibição do Modal**: Se tudo estiver válido, injeta os estilos e exibe o modal

### Eventos Customizados

O módulo dispara um evento `licenseInvalid` se a licença for inválida:

```javascript
window.addEventListener('licenseInvalid', (event) => {
  console.log('Licença inválida:', event.detail);
  // event.detail contém: { origin, key, error? }
});
```

## 🎨 Personalização

### Modal

O modal inclui:
- Título "Atenção"
- Tabela com colunas: N° Tarefa, SLA, Nome da Tarefa
- Dados de exemplo pré-carregados
- Botão de fechar (×) no canto superior direito
- Botão OK no canto inferior direito
- Rodapé com link para a licença

### Estilos

Os estilos são gerados com Tailwind CSS e incluem:
- Overlay escuro semi-transparente
- Modal centralizado ocupando 70% da tela
- Design responsivo
- Animações suaves

## 🚀 Deploy

O projeto usa GitHub Actions para build e deploy automático no GitHub Pages:

1. Push para a branch `main`
2. GitHub Actions executa o build
3. Deploy automático para `https://USERNAME.github.io/REPO/`

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Antonio Juevan**

---

© 2025 Antonio Juevan - Todos os direitos reservados.
