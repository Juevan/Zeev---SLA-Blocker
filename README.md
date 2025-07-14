# 🚀 Zeev SLA Blocker

Módulo JavaScript ES que exibe um modal com tarefas de correção pendentes na plataforma Zeev. **Agora implementado com Preact para melhor performance e reatividade!**

## 📋 **Como Usar**

### **1. Importação Simples**
Adicione esta linha **no final do `<body>`** da sua página HTML na plataforma Zeev:

```html
<script type="module" src="https://juevan.github.io/Zeev---SLA-Blocker/main.js?key=SUA_CHAVE_DE_LICENCA"></script>
```

### **2. Requisitos**
- ✅ **URL deve conter**: `/my` **E** `/services`
- ✅ **Chave válida**: Substitua `SUA_CHAVE_DE_LICENCA` pela sua chave válida
- ✅ **Navegador moderno**: Suporte a ES Modules (Chrome 61+, Firefox 60+, Safari 11+)

## 🔧 **Funcionalidades**

- 🔐 **Validação de licença automática** via API externa
- 🎯 **Verificação inteligente de URL** (só ativa em páginas `/my` + `/services`)
- ⚛️ **Interface reativa com Preact** - componentes otimizados e rápidos
- 🎨 **Modal responsivo** com Tailwind CSS embutido
- 📱 **Ocupa 70% da tela** com overlay bloqueante
- ⚡ **Tudo embutido**: CSS, HTML e componentes dentro do JavaScript
- 🛡️ **Não interfere** no CSS/JavaScript existente da página
- 🎯 **Fechamento inteligente**: ESC, clique no X, clique no OK ou clique fora do modal

## 🔄 **Fluxo de Funcionamento**

1. **Script carregado** → Extrai `key` da URL do módulo
2. **Valida URL** → Verifica se contém `/my` e `/services`
3. **Valida licença** → Faz requisição para API de validação
4. **Licença válida** → Injeta CSS e renderiza componentes Preact
5. **Licença inválida** → Para execução e dispara evento `licenseInvalid`

## ⚛️ **Arquitetura Preact**

### **Componentes**
- **`SLAModal`**: Componente principal do modal com gerenciamento de estado
- **`TaskTable`**: Tabela reativa que renderiza as tarefas automaticamente
- **Hooks utilizados**: `useEffect` para gerenciamento de eventos do teclado

### **Benefícios do Preact**
- 📦 **Bundle otimizado**: ~23KB total (Preact + Tailwind + toda a lógica)
- ⚡ **Performance**: Renderização rápida e eficiente com Virtual DOM
- 🔄 **Reatividade**: Interface atualiza automaticamente quando dados mudam
- 🧹 **Cleanup automático**: Eventos são removidos automaticamente quando componente desmonta
- 🎯 **Código limpo**: Arquitetura simplificada e organizada

## 🛠️ **Para Desenvolvedores**

### **Validação de Licença**
```javascript
// Evento disparado quando licença é inválida
window.addEventListener('licenseInvalid', (event) => {
  console.log('Licença inválida:', event.detail);
  // { origin: "...", key: "...", error?: "..." }
});
```

### **Build Local**
```bash
npm install
npm run build
```

### **Estrutura do Projeto**
```
src/
├── main.tsx          # Código principal com componentes Preact integrados
└── styles.css        # Estilos Tailwind

dist/
└── main.js           # Módulo final compilado com Preact
```

## 🔧 **Dependências**

### **Runtime**
- **Preact**: Framework reativo leve (~3KB)
- **Tailwind CSS**: Styling (embutido no bundle)

### **Desenvolvimento**
- **TypeScript**: Tipagem estática
- **esbuild**: Bundler rápido com suporte a JSX
- **Tailwind CSS**: Framework CSS utilitário

## 🌐 **URL do Módulo**
```
https://juevan.github.io/Zeev---SLA-Blocker/main.js?key=SUA_CHAVE
```

## 📝 **Exemplo Completo**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Página Zeev</title>
</head>
<body>
    <!-- Conteúdo da página -->
    <h1>Minha página na plataforma Zeev</h1>
    
    <!-- Importar módulo no final do body -->
    <script type="module" src="https://juevan.github.io/Zeev---SLA-Blocker/main.js?key=abc123def456"></script>
</body>
</html>
```

## ⚠️ **Importante**
- Modal só aparece em URLs que contenham **ambos**: `/my` **E** `/services`
- Licença é validada a cada carregamento
- Se a licença for inválida, o módulo não executa

## 📄 **Licença**
MIT © 2025 Antonio Juevan
