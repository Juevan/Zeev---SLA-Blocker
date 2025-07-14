import { render } from 'preact';
import { JSX } from 'preact';
import { useEffect } from 'preact/hooks';

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

// ===== COMPONENTES =====
interface TaskTableProps {
  tasks: TaskItem[];
}

function TaskTable({ tasks }: TaskTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">N° Tarefa</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Vencimento</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Nome da Tarefa</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task.cfe} className={index % 2 === 1 ? "bg-gray-50" : ""}>
              <td className="border border-gray-300 px-4 py-2">
                <a 
                  href={task.lk} 
                  data-key={task.cfetp} 
                  tabIndex={0} 
                  role="button" 
                  className="text-blue-600 hover:text-blue-800 underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {task.cfe}
                </a>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-red-600 font-semibold">
                {task.el}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {task.t}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SLAModalProps {
  tasks: TaskItem[];
  onClose: () => void;
}

function SLAModal({ tasks, onClose }: SLAModalProps): JSX.Element {
  const totalSolicitacoes = tasks.length;

  const handleOverlayClick = (e: Event) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      id="sla-modal-overlay" 
      className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[94]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-[70%] max-w-4xl max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Atenção</h2>
          <button 
            id="sla-modal-close-x" 
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-lg text-gray-700 mb-6">
            Você possui um total de <strong className="text-red-600">{totalSolicitacoes}</strong>{' '}
            {totalSolicitacoes === 1 ? 'solicitação' : 'solicitações'} com o SLA expirado:
          </p>
          
          <TaskTable tasks={tasks} />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © 
            <a 
              href="https://github.com/USERNAME/REPO/blob/main/LICENSE" 
              target="_blank" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Licença do Projeto
            </a>
          </p>
          <button 
            id="sla-modal-close-ok" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
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

  const keywords = ['corrigir', 'correção', 'correcao', 'ajuste', 'ajustar'];
  const allTasks: TaskItem[] = [];

  console.log('SLA Blocker: Verificando tarefas em atraso com múltiplas palavras-chave...');

  try {
    // Para cada palavra-chave, fazer busca paginada
    for (const keyword of keywords) {
      console.log(`SLA Blocker: Buscando tarefas com palavra-chave: "${keyword}"`);
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const url = `${window.location.origin}/api/internal/bpms/1.0/assignments?pagenumber=${page}&simulation=N&codreport=Kju5G9GOJbU7cHRcMb%252BRBA%253D%253D&reporttype=mytasks&codflowexecute=&=&codtask=&taskstatus=S&field=&operator=Equal&fieldvaluetext=&fielddatasource=&fieldvalue=&requester=&codrequester=&=&tasklate=Late&startbegin=&startend=&sortfield=dt&sortdirection=ASC&keyword=${encodeURIComponent(keyword)}`;

        const headers = {
          "Accept": "*/*",
          "Content-Type": "application/json",
          "x-sml-antiforgerytoken": token
        };

        const response = await fetch(url, {
          method: "GET",
          headers: headers,
          credentials: "include"
        });

        if (response.ok) {
          const data: TaskResponse = await response.json();
          
          if (data.success && data.success.itens && data.success.itens.length > 0) {
            console.log(`SLA Blocker: Página ${page} - ${data.success.itens.length} tarefas encontradas para "${keyword}"`);
            
            // Adicionar tarefas únicas (evitar duplicatas por CFE)
            data.success.itens.forEach((newTask: TaskItem) => {
              const exists = allTasks.some(existingTask => existingTask.cfe === newTask.cfe);
              if (!exists) {
                allTasks.push(newTask);
              }
            });

            page++;
          } else {
            // Não há mais itens nesta página
            hasMorePages = false;
            console.log(`SLA Blocker: Fim da paginação para "${keyword}" na página ${page}`);
          }
        } else {
          console.error(`Erro HTTP na página ${page} para "${keyword}":`, response.status, response.statusText);
          hasMorePages = false;
        }

        // Adicionar pequeno delay entre requisições para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`SLA Blocker: Total de ${allTasks.length} tarefas únicas de correção/ajuste encontradas`);
    return allTasks;

  } catch (error) {
    console.error("Erro na requisição:", error);
    return null;
  }
}

function createModal(tasks: TaskItem[]): void {
  // Se não há tarefas em atraso, não mostrar modal
  if (tasks.length === 0) {
    console.log('SLA Blocker: Nenhuma tarefa em atraso, modal não será exibido');
    return;
  }

  // Criar container para o modal
  const modalContainer = document.createElement('div');
  modalContainer.id = 'sla-modal-container';
  document.body.appendChild(modalContainer);

  // Função para fechar o modal
  const closeModal = () => {
    modalContainer.remove();
  };

  // Renderizar componente Preact
  render(
    <SLAModal tasks={tasks} onClose={closeModal} />,
    modalContainer
  );
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
      createModal(tasks);
    } else {
      console.log('SLA Blocker: Nenhuma tarefa em atraso encontrada, interface não será exibida');
    }

  } catch (error) {
    console.error('SLA Blocker: Erro crítico:', error);
  }
})();

// Exportar para debugging (opcional)
export { validateLicense, shouldExecute, verificaAtrasos };
