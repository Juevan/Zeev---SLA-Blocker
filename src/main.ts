// ===== TIPOS =====
interface LicenseValidationResponse {
  valid: boolean;
  message?: string;
}

interface CachedLicense {
  key: string;
  valid: boolean;
  timestamp: number;
  expiresAt: number;
}

// ===== UTILITÁRIOS =====
function shouldExecute(): boolean {
  const pathname = window.location.pathname.toLowerCase();
  return pathname.includes('/my') && pathname.includes('/services');
}

function getLicenseKey(): string | null {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    const url = new URL(import.meta.url);
    return url.searchParams.get('key');
  }
  
  console.error('import.meta.url não disponível - certifique-se de usar como módulo ES');
  return null;
}

function dispatchLicenseInvalidEvent(key: string, error?: string): void {
  const event = new CustomEvent('licenseInvalid', {
    detail: {
      origin: window.location.origin,
      key,
      ...(error && { error })
    }
  });
  window.dispatchEvent(event);
}

// ===== VALIDAÇÃO DE LICENÇA =====
// Cache de licenças (válido por 1 dia)
const LICENSE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 dia em ms
const licenseCache = new Map<string, CachedLicense>();

function getCachedLicense(key: string): boolean | null {
  const cached = licenseCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now > cached.expiresAt) {
    // Cache expirado, remover
    licenseCache.delete(key);
    return null;
  }
  
  console.log('SLA Blocker: Licença encontrada no cache');
  return cached.valid;
}

function setCachedLicense(key: string, valid: boolean): void {
  const now = Date.now();
  const cached: CachedLicense = {
    key,
    valid,
    timestamp: now,
    expiresAt: now + LICENSE_CACHE_DURATION
  };
  licenseCache.set(key, cached);
}

async function validateLicense(key: string): Promise<boolean> {
  // Verificar cache primeiro
  const cachedResult = getCachedLicense(key);
  if (cachedResult !== null) {
    if (!cachedResult) {
      dispatchLicenseInvalidEvent(key, 'Licença inválida (cache)');
    }
    return cachedResult;
  }
  
  try {
    console.log('SLA Blocker: Validando licença no servidor...');
    const response = await fetch(`https://validador-web.vercel.app/validate-license?key=${encodeURIComponent(key)}`);
    const data: LicenseValidationResponse = await response.json();
    
    // Armazenar resultado no cache
    setCachedLicense(key, data.valid);
    
    if (!data.valid) {
      console.error('Licença inválida:', data.message || 'Chave de licença não autorizada');
      dispatchLicenseInvalidEvent(key);
      return false;
    }
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao validar licença:', error);
    
    // Em caso de erro, não cachear resultado negativo por muito tempo
    // Apenas disparar o evento de licença inválida
    dispatchLicenseInvalidEvent(key, errorMessage);
    return false;
  }
}

// ===== UI =====
function injectStyles(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

function createModal(htmlContent: string): void {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  const modalElement = tempDiv.firstElementChild as HTMLElement;
  if (!modalElement) {
    console.error('Erro ao criar modal: HTML inválido');
    return;
  }
  
  document.body.appendChild(modalElement);
  
  // Configurar fechamento do modal
  const closeModal = () => modalElement.remove();
  
  // Selectors dos elementos de fechamento
  const selectors = ['#sla-modal-close-x', '#sla-modal-close-ok'];
  selectors.forEach(selector => {
    const element = modalElement.querySelector(selector) as HTMLButtonElement;
    element?.addEventListener('click', closeModal);
  });
  
  // Fechar ao clicar no overlay
  const overlay = modalElement.querySelector('#sla-modal-overlay') as HTMLElement;
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  
  // Fechar com ESC
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// ===== EXECUÇÃO PRINCIPAL =====
(async () => {
  try {
    // 1. Verificações preliminares (sem requisições HTTP)
    if (!shouldExecute()) {
      console.log('SLA Blocker: URL não atende aos critérios (/my e /services)');
      return;
    }
    
    const licenseKey = getLicenseKey();
    if (!licenseKey) {
      console.error('SLA Blocker: Chave de licença não encontrada na URL');
      return;
    }
    
    // 2. Validação de licença
    if (!(await validateLicense(licenseKey))) {
      return; // Eventos já disparados na função validateLicense
    }
    
    console.log('SLA Blocker: Licença válida, inicializando...');
    
    // 3. Aguardar DOM se necessário
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    
    // 4. Renderizar interface
    injectStyles('__CSS_CONTENT__');
    createModal('__HTML_CONTENT__');
    
  } catch (error) {
    console.error('SLA Blocker: Erro crítico:', error);
  }
})();

// Exportar para debugging (opcional)
export { validateLicense, shouldExecute };
