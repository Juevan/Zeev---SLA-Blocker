import { render } from 'preact';
import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

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
  onRefresh: () => Promise<void>;
}

function SLAModal({ tasks, onClose, onRefresh }: SLAModalProps): JSX.Element {
  const [currentTasks, setCurrentTasks] = useState<TaskItem[]>(tasks);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Atualização automática a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('SLA Blocker: Atualizando tarefas automaticamente...');
      await handleRefresh();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Atualizar tarefas quando props.tasks mudar
  useEffect(() => {
    setCurrentTasks(tasks);
    setLastUpdate(new Date());
  }, [tasks]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
      setLastUpdate(new Date());
      console.log('SLA Blocker: Tarefas atualizadas com sucesso');
    } catch (error) {
      console.error('SLA Blocker: Erro ao atualizar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (currentTasks.length === 0) {
      onClose();
    } else {
      alert('Você não pode fechar este modal enquanto houver tarefas de correção pendentes. Complete as tarefas ou use o botão de atualizar para verificar o status.');
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
        {/* Header */}
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
        
        {/* Status Bar */}
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
        
        {/* Content */}
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
            console.log('SLA Blocker: Exemplo de tarefa encontrada:', data.success.itens[0]);
            
            // Adicionar tarefas únicas (evitar duplicatas por CFE)
            data.success.itens.forEach((newTask: TaskItem) => {
              const exists = allTasks.some(existingTask => existingTask.cfe === newTask.cfe);
              if (!exists) {
                allTasks.push(newTask);
                console.log(`SLA Blocker: Tarefa ${newTask.cfe} adicionada. Total atual: ${allTasks.length}`);
              } else {
                console.log(`SLA Blocker: Tarefa ${newTask.cfe} já existe, ignorando duplicata`);
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
  console.log(`SLA Blocker: createModal chamado com ${tasks.length} tarefas`);
  
  // Se não há tarefas em atraso, não mostrar modal
  if (tasks.length === 0) {
    console.log('SLA Blocker: Nenhuma tarefa em atraso, modal não será exibido');
    return;
  }

  // Verificar se já existe um modal
  const existingModal = document.getElementById('sla-modal-container');
  if (existingModal) {
    console.log('SLA Blocker: Modal já existe, removendo...');
    existingModal.remove();
  }

  // Criar container para o modal
  const modalContainer = document.createElement('div');
  modalContainer.id = 'sla-modal-container';
  
  // Adicionar estilos inline para garantir visibilidade
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
  console.log('SLA Blocker: Container do modal adicionado ao DOM');

  // Estado das tarefas
  let currentTasks = [...tasks];

  // Função para fechar o modal
  const closeModal = () => {
    console.log('SLA Blocker: Fechando modal');
    modalContainer.remove();
  };

  // Função para atualizar tarefas
  const refreshTasks = async () => {
    console.log('SLA Blocker: Atualizando tarefas...');
    const newTasks = await verificaAtrasos();
    if (newTasks !== null) {
      currentTasks = newTasks;
      // Re-renderizar o componente com as novas tarefas
      render(
        <SLAModal tasks={currentTasks} onClose={closeModal} onRefresh={refreshTasks} />,
        modalContainer
      );
      console.log(`SLA Blocker: Tarefas atualizadas - ${currentTasks.length} tarefas encontradas`);
    }
  };

  // Renderizar componente Preact
  console.log('SLA Blocker: Renderizando componente Preact...');
  try {
    render(
      <SLAModal tasks={currentTasks} onClose={closeModal} onRefresh={refreshTasks} />,
      modalContainer
    );
    console.log('SLA Blocker: Componente Preact renderizado com sucesso!');
    
    // Verificar se o conteúdo foi renderizado
    setTimeout(() => {
      console.log('SLA Blocker: Verificando conteúdo renderizado...');
      console.log('SLA Blocker: innerHTML do container:', modalContainer.innerHTML.substring(0, 200) + '...');
      console.log('SLA Blocker: Children count:', modalContainer.children.length);
      
      if (modalContainer.children.length === 0) {
        console.error('SLA Blocker: ERRO - Nenhum elemento filho foi renderizado!');
      } else {
        console.log('SLA Blocker: ✅ Modal renderizado corretamente!');
      }
    }, 100);
    
  } catch (error) {
    console.error('SLA Blocker: Erro ao renderizar Preact:', error);
    
    // Fallback - criar modal simples em HTML puro
    console.log('SLA Blocker: Criando modal fallback...');
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

// ===== EXECUÇÃO PRINCIPAL =====
(async () => {
  console.log('SLA Blocker: Iniciando execução principal...');
  try {
    // 1. Verificações preliminares (sem requisições HTTP)
    console.log('SLA Blocker: Verificando critérios de execução...');
    console.log('SLA Blocker: URL atual:', window.location.pathname);
    
    if (!shouldExecute()) {
      console.log('SLA Blocker: URL não atende aos critérios (/my e /services)');
      console.log('SLA Blocker: Pathname atual:', window.location.pathname.toLowerCase());
      return;
    }
    console.log('SLA Blocker: ✓ Critérios de URL atendidos');

    console.log('SLA Blocker: Buscando chave de licença...');
    const licenseKey = getLicenseKey();
    if (!licenseKey) {
      console.error('SLA Blocker: Chave de licença não encontrada na URL');
      console.error('SLA Blocker: URL completa:', window.location.href);
      return;
    }
    console.log('SLA Blocker: ✓ Chave de licença encontrada:', licenseKey);

    // 2. Validação de licença
    console.log('SLA Blocker: Iniciando validação de licença...');
    if (!(await validateLicense(licenseKey))) {
      console.error('SLA Blocker: Validação de licença falhou');
      return; // Eventos já disparados na função validateLicense
    }

    console.log('SLA Blocker: ✓ Licença válida, inicializando...');

    // 3. Aguardar DOM se necessário
    console.log('SLA Blocker: Verificando estado do DOM...');
    if (document.readyState === 'loading') {
      console.log('SLA Blocker: Aguardando DOM carregar...');
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    console.log('SLA Blocker: ✓ DOM pronto');

    // 4. Verificar tarefas em atraso
    console.log('SLA Blocker: Iniciando verificação de tarefas em atraso...');
    const tasks = await verificaAtrasos();
    
    console.log('SLA Blocker: Resultado de verificaAtrasos:', tasks);
    console.log('SLA Blocker: Tipo do resultado:', typeof tasks);
    console.log('SLA Blocker: É array?', Array.isArray(tasks));
    
    if (tasks === null) {
      console.error('SLA Blocker: Erro ao verificar tarefas em atraso - resultado é null');
      return;
    }

    // 5. Renderizar interface apenas se houver tarefas em atraso
    console.log(`SLA Blocker: ✓ Verificação concluída - Total de tarefas processadas: ${tasks.length}`);
    console.log('SLA Blocker: Dados das tarefas:', tasks);
    
    if (tasks.length > 0) {
      console.log('SLA Blocker: Iniciando exibição do modal...');
      console.log('SLA Blocker: Injetando estilos CSS...');
      injectStyles('__CSS_CONTENT__');
      console.log('SLA Blocker: Chamando createModal...');
      createModal(tasks);
      console.log('SLA Blocker: ✅ Modal criado e renderizado com sucesso!');
    } else {
      console.log('SLA Blocker: ⚠️ Nenhuma tarefa em atraso encontrada, interface não será exibida');
    }

  } catch (error) {
    console.error('SLA Blocker: ❌ Erro crítico:', error);
    if (error instanceof Error) {
      console.error('SLA Blocker: Stack trace:', error.stack);
    }
  }
})();

// Exportar para debugging (opcional)
export { validateLicense, shouldExecute, verificaAtrasos };

// Para debugging no navegador
if (typeof window !== 'undefined') {
  (window as any).validateLicense = validateLicense;
  (window as any).shouldExecute = shouldExecute;
  (window as any).verificaAtrasos = verificaAtrasos;
  (window as any).createModal = createModal;
}
