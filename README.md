# 🚀 Zeev SLA Blocker

Módulo JavaScript ES que exibe um modal com tarefas de correção pendentes na plataforma Zeev.

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
- 🎨 **Modal responsivo** com Tailwind CSS embutido
- 📱 **Ocupa 70% da tela** com overlay bloqueante
- ⚡ **Tudo embutido**: CSS e HTML dentro do JavaScript
- 🛡️ **Não interfere** no CSS/JavaScript existente da página

## 🔄 **Fluxo de Funcionamento**

1. **Script carregado** → Extrai `key` da URL do módulo
2. **Valida URL** → Verifica se contém `/my` e `/services`
3. **Valida licença** → Faz requisição para API de validação
4. **Licença válida** → Injeta CSS e exibe modal
5. **Licença inválida** → Para execução e dispara evento `licenseInvalid`

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
├── main.ts        # Código principal do módulo
├── modal.html     # Template do modal
└── styles.css     # Estilos Tailwind

dist/
└── main.js        # Módulo final compilado
```

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
