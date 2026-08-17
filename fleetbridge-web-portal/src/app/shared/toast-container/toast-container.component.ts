import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
          <span class="toast-icon">{{ iconFor(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.1rem;
      border-radius: 12px;
      min-width: 300px;
      max-width: 420px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      cursor: pointer;
      pointer-events: all;
      animation: slideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: transform 0.15s, opacity 0.15s;
    }

    .toast:hover { transform: scale(1.01); }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(60px) scale(0.9); }
      to   { opacity: 1; transform: translateX(0)   scale(1); }
    }

    .toast--success {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.35);
      color: #6ee7b7;
    }
    .toast--error {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.35);
      color: #fca5a5;
    }
    .toast--warning {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.35);
      color: #fcd34d;
    }
    .toast--info {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
    }

    .toast-icon { font-size: 1.15rem; flex-shrink: 0; }
    .toast-message { flex: 1; font-size: 0.875rem; font-weight: 500; line-height: 1.4; }
    .toast-close {
      background: none; border: none; cursor: pointer;
      color: inherit; opacity: 0.6; font-size: 1.25rem; padding: 0;
      line-height: 1; flex-shrink: 0;
    }
    .toast-close:hover { opacity: 1; }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  iconFor(type: Toast['type']): string {
    return { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type];
  }
}
