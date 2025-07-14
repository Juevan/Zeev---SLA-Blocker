import { render } from 'preact';
import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { showError } from './alerts';

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

function TaskTable({ tasks }: { tasks: TaskItem[] }): JSX.Element {
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

function SLAModal({ tasks, onClose, onRefresh }: { tasks: TaskItem[]; onClose: () => void; onRefresh: () => Promise<void> }): JSX.Element {
  const [currentTasks, setCurrentTasks] = useState<TaskItem[]>(tasks);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(async () => {
      await handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentTasks(tasks);
    setLastUpdate(new Date());
  }, [tasks]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao atualizar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (currentTasks.length === 0) {
      onClose();
    } else {
      showError(
        'Bloqueio de novas solicitações',
        `Você não pode realizar novas solicitações enquanto houver ${currentTasks.length} tarefa(s) de correção pendente(s). Complete as tarefas ou use o botão de atualizar para verificar o status.`,
        {
          duration: 8000,
          actions: [
            {
              label: 'Atualizar Agora',
              onClick: handleRefresh,
              style: 'primary'
            }
          ]
        }
      );
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div 
      id="sla-modal-overlay" 
      className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center"
      style={{ zIndex: 94 }}
    >
      <div className="bg-white rounded-lg shadow-xl w-[70%] max-w-4xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Atenção - Tarefas de Correção</h2>
          <button 
            id="sla-modal-close-x" 
            className={`text-2xl font-bold ${currentTasks.length === 0 ? 'text-gray-400 hover:text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
            onClick={handleClose}
            title={currentTasks.length > 0 ? 'Não é possível fechar enquanto há tarefas pendentes' : 'Fechar modal'}
          >
            ×
          </button>
        </div>
        
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Última atualização: {formatTime(lastUpdate)}
            </span>
            <span className={`text-sm font-semibold ${currentTasks.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {currentTasks.length > 0 ? `${currentTasks.length} tarefa(s) pendente(s)` : 'Nenhuma tarefa pendente'}
            </span>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            title="Atualizar lista de tarefas"
          >
            <span className={`${isLoading ? 'animate-spin' : ''}`}>
              {isLoading ? '🔄' : '🔄'}
            </span>
            <span>{isLoading ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
        
        <div className="p-6">
          {currentTasks.length > 0 ? (
            <>
              <p className="text-lg text-gray-700 mb-6">
                Você possui as seguintes tarefas de correção pendentes:
              </p>
              <TaskTable tasks={currentTasks} />
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Parabéns!</h3>
              <p className="text-gray-600">Não há tarefas de correção pendentes no momento.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © 
            <a 
              href="https://raw.githubusercontent.com/Juevan/ZeevSLABlocker/refs/heads/main/LICENSE" 
              target="_blank" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Licença do Projeto
            </a>
          </p>
          <button 
            id="sla-modal-close-ok" 
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              currentTasks.length === 0 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleClose}
            title={currentTasks.length > 0 ? 'Complete as tarefas antes de fechar' : 'Fechar modal'}
          >
            {currentTasks.length === 0 ? 'OK' : `Pendente (${currentTasks.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function shouldExecute(): boolean {
  const pathname = window.location.pathname.toLowerCase();
  return pathname.includes('/my') && pathname.includes('/services');
}

function getLicenseKey(): string | null {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    const url = new URL(import.meta.url);
    return url.searchParams.get('key');
  }
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

const LICENSE_CACHE_DURATION = 24 * 60 * 60 * 1000;
const licenseCache = new Map<string, CachedLicense>();

function getCachedLicense(key: string): boolean | null {
  const cached = licenseCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    licenseCache.delete(key);
    return null;
  }

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
  const cachedResult = getCachedLicense(key);
  if (cachedResult !== null) {
    if (!cachedResult) {
      dispatchLicenseInvalidEvent(key, 'Licença inválida (cache)');
    }
    return cachedResult;
  }

  try {
    const response = await fetch(`https://validador-web.vercel.app/validate-license?key=${encodeURIComponent(key)}`);
    const data: LicenseValidationResponse = await response.json();

    setCachedLicense(key, data.valid);

    if (!data.valid) {
      dispatchLicenseInvalidEvent(key);
      return false;
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    dispatchLicenseInvalidEvent(key, errorMessage);
    return false;
  }
}

function injectStyles(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

async function verificaAtrasos(): Promise<TaskItem[]> {
  const tokenElement = document.querySelector('input[name="__RequestVerificationToken"]') as HTMLInputElement;
  const token = tokenElement?.value;

  if (!token) {
    throw new Error("Token de verificação não encontrado");
  }

  const keywords = ['corrigir', 'correcao', 'ajuste', 'ajustar'];
  const allTasks: TaskItem[] = [];
  const taskSet = new Set<string>();

  try {
    let page = 1;
    const batchSize = 3;

    while (true) {
      const promises = [];
      for (let i = 0; i < batchSize; i++) {
        const currentPage = page + i;
        const url = `${window.location.origin}/api/internal/bpms/1.0/assignments?pagenumber=${currentPage}&simulation=N&codreport=Kju5G9GOJbU7cHRcMb%252BRBA%253D%253D&reporttype=mytasks&codflowexecute=&=&codtask=&taskstatus=S&field=&operator=Equal&fieldvaluetext=&fielddatasource=&fieldvalue=&requester=&codrequester=&=&tasklate=Late&startbegin=&startend=&sortfield=dt&sortdirection=ASC`;

        promises.push(
          fetch(url, {
            method: "GET",
            headers: {
              "Accept": "*/*",
              "Content-Type": "application/json",
              "x-sml-antiforgerytoken": token
            },
            credentials: "include"
          }).then(async response => {
            if (response.ok) {
              const data: TaskResponse = await response.json();
              return { page: currentPage, data: data.success?.itens || [] };
            }
            return { page: currentPage, data: [] };
          }).catch(() => ({ page: currentPage, data: [] }))
        );
      }

      const results = await Promise.all(promises);
      let hasData = false;

      results.sort((a, b) => a.page - b.page);

      for (const result of results) {
        if (result.data.length > 0) {
          hasData = true;
          
          const filteredTasks = result.data.filter(task => {
            const taskName = task.t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return keywords.some(kw => 
              taskName.includes(kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
            );
          });

          filteredTasks.forEach(task => {
            if (!taskSet.has(task.cfe)) {
              taskSet.add(task.cfe);
              allTasks.push(task);
            }
          });
        }
      }

      if (!hasData) {
        break;
      }

      page += batchSize;
    }

    return allTasks;

  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }
}

function createModal(tasks: TaskItem[]): void {
  if (tasks.length === 0) return;

  const existingModal = document.getElementById('sla-modal-container');
  if (existingModal) {
    existingModal.remove();
  }

  const modalContainer = document.createElement('div');
  modalContainer.id = 'sla-modal-container';
  modalContainer.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    z-index: 94 !important;
    pointer-events: auto !important;
    display: block !important;
  `;
  
  document.body.appendChild(modalContainer);

  let currentTasks = [...tasks];

  const closeModal = () => {
    modalContainer.remove();
  };

  const refreshTasks = async () => {
    const newTasks = await verificaAtrasos();
    currentTasks = newTasks;
    render(
      <SLAModal tasks={currentTasks} onClose={closeModal} onRefresh={refreshTasks} />,
      modalContainer
    );
  };

  try {
    render(
      <SLAModal tasks={currentTasks} onClose={closeModal} onRefresh={refreshTasks} />,
      modalContainer
    );
  } catch (error) {
    console.error('Erro ao renderizar modal:', error);
    
    modalContainer.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 94;">
        <div style="background: white; padding: 20px; border-radius: 8px; max-width: 80%; max-height: 80%; overflow: auto;">
          <h2>SLA Blocker - Atenção</h2>
          <p>Você possui ${tasks.length} tarefa(s) com SLA expirado:</p>
          <ul>
            ${tasks.map(task => `<li>${task.cfe}: ${task.t}</li>`).join('')}
          </ul>
          <button onclick="document.getElementById('sla-modal-container').remove()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">OK</button>
        </div>
      </div>
    `;
  }
}

(async () => {
  try {
    if (!shouldExecute()) {
      return;
    }

    const licenseKey = getLicenseKey();
    if (!licenseKey) {
      return;
    }

    const [isLicenseValid, tasks] = await Promise.all([
      validateLicense(licenseKey),
      verificaAtrasos()
    ]);

    if (!isLicenseValid) {
      return;
    }

    if (tasks.length > 0) {
      injectStyles('__CSS_CONTENT__');
      createModal(tasks);
    }

  } catch (error) {
    console.error('SLA Blocker: Erro crítico:', error);
  }
})();

export { validateLicense, shouldExecute, verificaAtrasos };

if (typeof window !== 'undefined') {
  (window as any).validateLicense = validateLicense;
  (window as any).shouldExecute = shouldExecute;
  (window as any).verificaAtrasos = verificaAtrasos;
  (window as any).createModal = createModal;
}
