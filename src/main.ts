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

interface TaskItem {
  cfe: string;
  cfetp: string;
  lk: string;
  el: string;
  t: string;
}

interface TaskResponse {
  success: {
    itens: TaskItem[];
  };
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

async function verificaAtrasos(): Promise<TaskItem[] | null> {
  // Buscar token de verificação
  const tokenElement = document.querySelector('input[name="__RequestVerificationToken"]') as HTMLInputElement;
  const token = tokenElement?.value;

  if (!token) {
    console.error("Token de verificação não encontrado.");
    return null;
  }

  const url = `${window.location.origin}/api/internal/bpms/1.0/assignments?pagenumber=1&simulation=N&codreport=6x6Iw2g5qn7z%252Bt743f1Lbg%253D%253D&reporttype=mytasks&codflowexecute=&=&codtask=&taskstatus=S&field=&operator=Equal&fieldvaluetext=&fielddatasource=&fieldvalue=&requester=&codrequester=&=&tasklate=Late&startbegin=&startend=&sortfield=&sortdirection=ASC&keyword=&chkReload=on`;

  const headers = {
    "Accept": "*/*",
    "Content-Type": "application/json",
    "x-sml-antiforgerytoken": token
  };

  try {
    console.log('SLA Blocker: Verificando tarefas em atraso...');
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      credentials: "include"
    });

    if (response.ok) {
      const data: TaskResponse = await response.json();
      if (data.success && data.success.itens && data.success.itens.length > 0) {
        console.log(`SLA Blocker: ${data.success.itens.length} tarefas em atraso encontradas`);
        return data.success.itens;
      } else {
        console.log("SLA Blocker: Nenhuma tarefa em atraso encontrada");
        return [];
      }
    } else {
      console.error("Erro HTTP:", response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return null;
  }
}

function createModal(htmlContent: string, tasks: TaskItem[]): void {
  // Se não há tarefas em atraso, não mostrar modal
  if (tasks.length === 0) {
    console.log('SLA Blocker: Nenhuma tarefa em atraso, modal não será exibido');
    return;
  }

  const totalSolicitacoes = tasks.length;

  // Gerar linhas da tabela com dados reais
  const tableRows = tasks.map(item => `
    <tr>
      <td class="border border-gray-300 px-4 py-2">
        <a href="${item.lk}" data-key="${item.cfetp}" tabindex="0" role="button" class="text-blue-600 hover:text-blue-800 underline">
          ${item.cfe}
        </a>
      </td>
      <td class="border border-gray-300 px-4 py-2 text-red-600 font-semibold">${item.el}</td>
      <td class="border border-gray-300 px-4 py-2">${item.t}</td>
    </tr>
  `).join('');

  // Substituir conteúdo da tabela no HTML do modal
  const updatedHtmlContent = htmlContent
    .replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${tableRows}</tbody>`)
    .replace(/Você possui as seguintes tarefas de correção:/,
      `Você possui um total de <strong class="text-red-600">${totalSolicitacoes}</strong> ${totalSolicitacoes === 1 ? 'solicitação' : 'solicitações'} com o SLA expirado:`);

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = updatedHtmlContent;

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

    // 4. Verificar tarefas em atraso
    const tasks = await verificaAtrasos();
    if (tasks === null) {
      console.error('SLA Blocker: Erro ao verificar tarefas em atraso');
      return;
    }

    // 5. Renderizar interface apenas se houver tarefas em atraso
    if (tasks.length > 0) {
      injectStyles('__CSS_CONTENT__');
      createModal('__HTML_CONTENT__', tasks);
    } else {
      console.log('SLA Blocker: Nenhuma tarefa em atraso encontrada, interface não será exibida');
    }

  } catch (error) {
    console.error('SLA Blocker: Erro crítico:', error);
  }
})();

// Exportar para debugging (opcional)
export { validateLicense, shouldExecute, verificaAtrasos };
