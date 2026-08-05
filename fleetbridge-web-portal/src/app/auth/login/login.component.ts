import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-card">
      <div class="login-header">
        <span class="brand-icon">🚌</span>
        <h1 class="brand-title">FleetBridge</h1>
        <p class="brand-subtitle">Enterprise Transportation Management</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <input
            id="email"
            type="email"
            class="form-input"
            formControlName="email"
            placeholder="admin&#64;fleetbridge.io"
            autocomplete="email"
          />
          @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
            <span class="form-error">Valid email is required</span>
          }
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            type="password"
            class="form-input"
            formControlName="password"
            placeholder="Enter your password"
            autocomplete="current-password"
          />
          @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
            <span class="form-error">Password is required (min 6 characters)</span>
          }
        </div>

        @if (errorMessage) {
          <div class="error-banner">{{ errorMessage }}</div>
        }

        <button type="submit" class="btn-primary" [disabled]="loginForm.invalid || isLoading">
          @if (isLoading) {
            <span class="spinner"></span> Signing in...
          } @else {
            Sign In
          }
        </button>
      </form>

      <div class="login-footer">
        <p class="demo-hint">Demo: admin&#64;fleetbridge.io / admin123</p>
      </div>
    </div>
  `,
  styles: [`
    .login-card {
      background: var(--surface-glass);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border-glass);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    .brand-title {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }

    .brand-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-input {
      padding: 0.85rem 1rem;
      border-radius: 10px;
      border: 1px solid var(--border-glass);
      background: var(--input-bg);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-input::placeholder {
      color: var(--text-muted);
    }

    .form-input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-primary-alpha);
    }

    .form-error {
      font-size: 0.8rem;
      color: var(--danger);
    }

    .error-banner {
      padding: 0.75rem 1rem;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger);
      font-size: 0.85rem;
      text-align: center;
    }

    /* Button */
    .btn-primary {
      padding: 0.85rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Footer */
    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
    }

    .demo-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      background: var(--hover-glass);
      padding: 0.5rem 1rem;
      border-radius: 8px;
    }
  `],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    this.authService.login();
  }
}
