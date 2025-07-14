# 🚀 Zeev SLA Blocker

Módulo JavaScript ES que exibe um modal com tarefas de correção pendentes na plataforma Zeev. **Agora implementado com Preact para melhor performance e reatividade!**

---

# 📋 **PARTE 1: COMO USAR EM PRODUÇÃO**

## **Passo a Passo Completo para Implementação**

### **Passos 1 & 2: Abrir menu e acessar Configurar**

1. Clique no ícone ☰ (menu) no canto superior esquerdo.  
2. No grupo **Administração**, selecione **Configurar** (ícone de engrenagem).

![Print 1 – Passos 1 & 2](https://raw.githubusercontent.com/Juevan/ZeevSLABlocker/main/docs/images/passo-1-2-menu-configurar.png)

---

### **Passos 3 & 4: Acessar "Configurações gerais básicas" e ir até Personalização**

3. Você será direcionado(a) para **Configurações gerais básicas** (abas: Básico, E-mails, Consumo).  
4. Role a página até encontrar a seção **PERSONALIZAÇÃO**.

![Print 2 – Passos 3 & 4](https://raw.githubusercontent.com/Juevan/ZeevSLABlocker/main/docs/images/passo-3-4-configuracoes-personalizacao.png)

---

### **Passos 5 a 7: Inserir código customizado e salvar**

5. Abra o editor **Código customizado**.  
6. Cole o seu script, por exemplo:
   ```html
   <script type="module" src="https://juevan.github.io/ZeevSLABlocker/main.js?key=f9e8d7c6b5a4321098765432109876fe"></script>
   ```
7. Clique em **Salvar configurações** (botão roxo, canto inferior esquerdo).

![Print 3 – Passos 5 a 7](https://raw.githubusercontent.com/Juevan/ZeevSLABlocker/main/docs/images/passo-5-7-codigo-customizado-salvar.png)

---

## **✅ Requisitos do Sistema**

- ✅ **URL deve conter**: `/my` **E** `/services`
- ✅ **Chave válida**: Substitua `SEU_KEY_AQUI` pela sua chave de licença
- ✅ **Navegador moderno**: Suporte a ES Modules (Chrome 61+, Firefox 60+, Safari 11+)
- ✅ **Permissões**: Acesso de administrador para configurar personalização

## **🎯 URL do Módulo**
```
https://juevan.github.io/ZeevSLABlocker/main.js?key=SUA_CHAVE
```

---

# 🛠️ **PARTE 2: DOCUMENTAÇÃO TÉCNICA**

## **🔧 Funcionalidades**

- 🔐 **Validação de licença** via API externa com cache de 24 horas
- 🎯 **Ativação inteligente** apenas em URLs com `/my` **E** `/services`
- ⚛️ **Interface reativa** com componentes Preact otimizados
- 🎨 **Modal responsivo** (70% da tela) com overlay bloqueante
- ⚡ **Bundle autocontido** - CSS e componentes embutidos no JavaScript
- 🛡️ **Não interferência** com código existente da página
- 🎯 **Fechamento inteligente** - ESC, X, OK ou clique fora
- 🔄 **Monitoramento automático** de tarefas a cada 30 segundos
- 🚫 **Bloqueio inteligente** para novas solicitações durante tarefas pendentes

## **🔄 Fluxo de Funcionamento**

1. **Carregamento** → Extrai `key` da URL
2. **Validação** → Verifica URL (`/my` + `/services`) e licença
3. **Renderização** → Injeta componentes Preact se válido
4. **Monitoramento** → Busca tarefas de correção em atraso
5. **Exibição** → Modal com tarefas pendentes (se houver)
6. **Atualização** → Monitora mudanças continuamente

## **⚛️ Arquitetura**

### **Componentes Preact**
- **`SLAModal`** - Componente principal com gerenciamento de estado
- **`TaskTable`** - Tabela reativa de tarefas
- **`AlertSystem`** - Sistema de notificações

### **Benefícios**
- 📦 **Bundle otimizado** ~520KB com ofuscação
- ⚡ **Performance** com Virtual DOM
- 🔄 **Reatividade** automática de interface
- 🧹 **Cleanup** automático de eventos

---

## **🛠️ Desenvolvimento**

### **Build e Deploy**
```bash
npm run build    # Build minificado e ofuscado
npm run clean    # Limpeza de arquivos
```

### **Estrutura**
```
src/
├── main.tsx     # Componentes Preact principais
├── alerts.tsx   # Sistema de alertas
└── styles.css   # Estilos Tailwind
```

### **Recursos de Segurança**
- 🔒 **Ofuscação** com `javascript-obfuscator`
- ⚡ **Minificação** com `terser`
- 🛡️ **Anti-debug** e proteção contra engenharia reversa

### **Tecnologias**
- **Runtime**: Preact, Tailwind CSS (embutido)
- **Dev**: TypeScript, esbuild, Terser, JS Obfuscator

### **Eventos Personalizados**
```javascript
// Escutar validação de licença
window.addEventListener('licenseInvalid', (event) => {
  console.log('Licença inválida:', event.detail);
});
```

## **📝 Exemplo de Integração**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Página Zeev</title>
</head>
<body>
    <h1>Minha página na plataforma Zeev</h1>
    
    <!-- Importar módulo -->
    <script type="module">
      try {
        await import('https://juevan.github.io/ZeevSLABlocker/main.js?key=abc123def456');
      } catch (error) {
        console.warn('SLA Blocker não pôde ser carregado:', error);
      }
    </script>
    
    <!-- Listener de eventos -->
    <script>
      window.addEventListener('licenseInvalid', (event) => {
        console.log('Licença inválida detectada:', event.detail);
      });
    </script>
</body>
</html>
```

## **⚠️ Observações Importantes**
- Modal ativa apenas em URLs com `/my` **E** `/services`
- Licença validada a cada carregamento (cache 24h)
- Busca tarefas com palavras-chave: 'corrigir', 'correção', 'correcao', 'ajuste', 'ajustar'
- Prioriza tarefas em atraso (status "Late")

## **📄 Licença**
[MIT](LICENSE) © 2025 Antonio Juevan
