import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      <div class="auth-content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--bg-primary);
    }

    .auth-background {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.4;
      animation: float 8s ease-in-out infinite;
    }

    .orb-1 {
      width: 500px;
      height: 500px;
      background: var(--accent-primary);
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 400px;
      height: 400px;
      background: var(--accent-secondary);
      bottom: -80px;
      right: -80px;
      animation-delay: 2s;
    }

    .orb-3 {
      width: 300px;
      height: 300px;
      background: var(--accent-tertiary);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-30px); }
    }

    .orb-3 {
      @keyframes float-center {
        0%, 100% { transform: translate(-50%, -50%) translateY(0); }
        50% { transform: translate(-50%, -50%) translateY(-30px); }
      }
      animation: float-center 8s ease-in-out infinite;
      animation-delay: 4s;
    }

    .auth-content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
      padding: 2rem;
    }
  `],
})
export class AuthLayoutComponent {}
