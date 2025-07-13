// Tipos para a API de validação de licença
interface LicenseValidationResponse {
  valid: boolean;
  message?: string;
}

// Função para extrair parâmetros da URL do módulo
function getLicenseKey(): string | null {
  // Em módulos ES, usar import.meta.url é a forma correta
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    const url = new URL(import.meta.url);
    return url.searchParams.get('key');
  }
  
  console.error('import.meta.url não disponível - certifique-se de usar como módulo ES');
  return null;
}

// Função para validar a licença
async function validateLicense(key: string): Promise<boolean> {
  try {
    const response = await fetch(`https://validador-web.vercel.app/validate-license?key=${encodeURIComponent(key)}`);
    const data: LicenseValidationResponse = await response.json();
    
    if (!data.valid) {
      console.error('Licença inválida:', data.message || 'Chave de licença não autorizada');
      
      // Disparar evento customizado
      const event = new CustomEvent('licenseInvalid', {
        detail: {
          origin: window.location.origin,
          key: key
        }
      });
      window.dispatchEvent(event);
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao validar licença:', error);
    
    // Disparar evento customizado em caso de erro
    const event = new CustomEvent('licenseInvalid', {
      detail: {
        origin: window.location.origin,
        key: key,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    });
    window.dispatchEvent(event);
    
    return false;
  }
}

// Função para verificar se a URL atende aos critérios
function shouldExecute(): boolean {
  const pathname = window.location.pathname.toLowerCase();
  return pathname.includes('/my') && pathname.includes('/services');
}

// Função para injetar CSS
function injectStyles(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

// Função para criar e mostrar o modal
function createModal(htmlContent: string): void {
  // Criar container temporário para converter HTML string em elementos
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  const modalElement = tempDiv.firstElementChild as HTMLElement;
  if (!modalElement) {
    console.error('Erro ao criar modal: HTML inválido');
    return;
  }
  
  // Adicionar modal ao body
  document.body.appendChild(modalElement);
  
  // Configurar eventos de fechamento
  const closeX = modalElement.querySelector('#sla-modal-close-x') as HTMLButtonElement;
  const closeOk = modalElement.querySelector('#sla-modal-close-ok') as HTMLButtonElement;
  const overlay = modalElement.querySelector('#sla-modal-overlay') as HTMLElement;
  
  const closeModal = () => {
    modalElement.remove();
  };
  
  // Event listeners
  if (closeX) closeX.addEventListener('click', closeModal);
  if (closeOk) closeOk.addEventListener('click', closeModal);
  
  // Fechar ao clicar no overlay (fundo)
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }
  
  // Fechar com ESC
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// IIFE assíncrono - execução principal do módulo
(async () => {
  try {
    // 1. Verificar se deve executar baseado na URL
    if (!shouldExecute()) {
      console.log('Módulo SLA Blocker: URL não atende aos critérios (/my e /services)');
      return;
    }
    
    // 2. Extrair chave de licença
    const licenseKey = getLicenseKey();
    if (!licenseKey) {
      console.error('Módulo SLA Blocker: Chave de licença não encontrada na URL');
      return;
    }
    
    // 3. Validar licença ANTES de fazer qualquer coisa
    const isValidLicense = await validateLicense(licenseKey);
    if (!isValidLicense) {
      return; // Parar execução se licença inválida
    }
    
    console.log('Módulo SLA Blocker: Licença válida, inicializando...');
    
    // 4. Aguardar DOM se necessário
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    
    // 5. Injetar estilos (será substituído pelo CSS real durante o build)
    const css = '__CSS_CONTENT__';
    injectStyles(css);
    
    // 6. Criar e mostrar modal (será substituído pelo HTML real durante o build)
    const htmlContent = '__HTML_CONTENT__';
    createModal(htmlContent);
    
  } catch (error) {
    console.error('Erro no módulo SLA Blocker:', error);
  }
})();

// Exportar para debugging (opcional)
export { validateLicense, shouldExecute };
