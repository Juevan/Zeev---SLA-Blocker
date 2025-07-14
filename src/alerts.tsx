import { render } from 'preact';
import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

// ===== TIPOS =====
export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertOptions {
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
  showCloseButton?: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

interface AlertItemProps extends AlertOptions {
  id: string;
  onClose: (id: string) => void;
}

// ===== CONFIGURAÇÕES VISUAIS =====
const AlertIcons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

const AlertStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-500',
    button: 'bg-green-600 hover:bg-green-700 text-white',
    closeButton: 'text-green-400 hover:text-green-600'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-500',
    button: 'bg-red-600 hover:bg-red-700 text-white',
    closeButton: 'text-red-400 hover:text-red-600'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-500',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    closeButton: 'text-yellow-400 hover:text-yellow-600'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    closeButton: 'text-blue-400 hover:text-blue-600'
  }
};

// ===== COMPONENTES =====
function AlertItem({ id, type, title, message, duration = 5000, showCloseButton = true, actions = [], onClose }: AlertItemProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const style = AlertStyles[type];

  return (
    <div 
      className={`
        transform transition-all duration-300 ease-in-out mb-4 max-w-md w-full
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <div className={`border rounded-lg p-4 shadow-lg ${style.container}`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 text-xl mr-3 ${style.icon}`}>
            {AlertIcons[type]}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1">{title}</h3>
            <p className="text-sm opacity-90">{message}</p>
            
            {actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      handleClose();
                    }}
                    className={`
                      px-3 py-1 text-xs font-semibold rounded transition-colors
                      ${action.style === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
                        action.style === 'secondary' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' :
                        style.button}
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {showCloseButton && (
            <button
              onClick={handleClose}
              className={`flex-shrink-0 ml-2 text-lg font-bold transition-colors ${style.closeButton}`}
              title="Fechar"
            >
              ×
            </button>
          )}
        </div>
        
        {duration > 0 && (
          <div className="mt-3 h-1 bg-black bg-opacity-10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current opacity-50 rounded-full animate-pulse"
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function AlertContainer({ alerts, onClose }: { alerts: AlertItemProps[], onClose: (id: string) => void }): JSX.Element {
  return (
    <div 
      id="alert-container"
      className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none"
    >
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        #alert-container > * {
          pointer-events: auto;
        }
      `}</style>
      
      {alerts.map(alert => (
        <AlertItem
          key={alert.id}
          {...alert}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

// ===== GERENCIADOR DE ALERTAS =====
export class AlertManager {
  private alerts: AlertItemProps[] = [];
  private container: HTMLElement | null = null;
  private static instance: AlertManager;

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  private ensureContainer(): void {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'alert-manager-root';
      document.body.appendChild(this.container);
    }
  }

  private render(): void {
    this.ensureContainer();
    if (this.container) {
      render(
        <AlertContainer 
          alerts={this.alerts} 
          onClose={(id) => this.removeAlert(id)} 
        />,
        this.container
      );
    }
  }

  private generateId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Exibe um alerta
   * @param options Configurações do alerta
   * @returns ID do alerta criado
   */
  show(options: AlertOptions): string {
    const id = this.generateId();
    const alert: AlertItemProps = {
      id,
      ...options,
      onClose: this.removeAlert.bind(this)
    };

    this.alerts.push(alert);
    this.render();

    console.log(`Alert criado: ${id} - ${options.type}: ${options.title}`);
    return id;
  }

  /**
   * Remove um alerta específico
   * @param id ID do alerta a ser removido
   */
  removeAlert(id: string): void {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
    this.render();
    
    if (this.alerts.length === 0 && this.container) {
      setTimeout(() => {
        if (this.alerts.length === 0 && this.container) {
          this.container.remove();
          this.container = null;
        }
      }, 500);
    }
  }

  /**
   * Remove todos os alertas
   */
  clear(): void {
    this.alerts = [];
    this.render();
    
    if (this.container) {
      setTimeout(() => {
        if (this.container) {
          this.container.remove();
          this.container = null;
        }
      }, 500);
    }
  }

  // ===== MÉTODOS DE CONVENIÊNCIA =====

  /**
   * Exibe um alerta de sucesso
   */
  success(title: string, message: string, options?: Partial<AlertOptions>): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration: 5000,
      ...options
    });
  }

  /**
   * Exibe um alerta de erro (não se fecha automaticamente)
   */
  error(title: string, message: string, options?: Partial<AlertOptions>): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration: 0, // Não fecha automaticamente
      ...options
    });
  }

  /**
   * Exibe um alerta de aviso
   */
  warning(title: string, message: string, options?: Partial<AlertOptions>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration: 7000,
      ...options
    });
  }

  /**
   * Exibe um alerta informativo
   */
  info(title: string, message: string, options?: Partial<AlertOptions>): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration: 5000,
      ...options
    });
  }

  /**
   * Exibe um alerta de confirmação com ações
   */
  confirm(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    options?: Partial<AlertOptions>
  ): string {
    const actions: AlertAction[] = [
      {
        label: 'Confirmar',
        onClick: onConfirm,
        style: 'primary'
      }
    ];

    if (onCancel) {
      actions.push({
        label: 'Cancelar',
        onClick: onCancel,
        style: 'secondary'
      });
    }

    return this.show({
      type: 'warning',
      title,
      message,
      duration: 0, // Não fecha automaticamente
      actions,
      ...options
    });
  }
}

// ===== INSTÂNCIA GLOBAL E FUNÇÕES DE CONVENIÊNCIA =====
export const alertManager = AlertManager.getInstance();

// Funções de conveniência para uso direto
export const showAlert = (options: AlertOptions) => alertManager.show(options);
export const showSuccess = (title: string, message: string, options?: Partial<AlertOptions>) => 
  alertManager.success(title, message, options);
export const showError = (title: string, message: string, options?: Partial<AlertOptions>) => 
  alertManager.error(title, message, options);
export const showWarning = (title: string, message: string, options?: Partial<AlertOptions>) => 
  alertManager.warning(title, message, options);
export const showInfo = (title: string, message: string, options?: Partial<AlertOptions>) => 
  alertManager.info(title, message, options);
export const showConfirm = (
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel?: () => void,
  options?: Partial<AlertOptions>
) => alertManager.confirm(title, message, onConfirm, onCancel, options);

// Para compatibilidade com projetos que não usam ES modules
if (typeof window !== 'undefined') {
  (window as any).AlertManager = AlertManager;
  (window as any).alertManager = alertManager;
  (window as any).showAlert = showAlert;
  (window as any).showSuccess = showSuccess;
  (window as any).showError = showError;
  (window as any).showWarning = showWarning;
  (window as any).showInfo = showInfo;
  (window as any).showConfirm = showConfirm;
}
