import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DriverService } from '../../../../core/services/driver.service';

@Component({
  selector: 'app-add-driver-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="custom-dialog-card">
      <!-- Header -->
      <div class="dialog-header">
        <div class="title-group">
          <h2 class="dialog-title">Onboard New Driver</h2>
          <p class="dialog-subtitle">Enter driver credentials and details below</p>
        </div>
        <button type="button" class="btn-close" mat-dialog-close aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Form Body -->
      <form [formGroup]="driverForm" (ngSubmit)="onSubmit()" class="dialog-body">
        <div *ngIf="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <div class="form-grid">
          <!-- First Name -->
          <div class="form-group">
            <label class="form-label">First Name <span class="required">*</span></label>
            <input 
              type="text" 
              formControlName="firstName" 
              placeholder="e.g. John"
              class="custom-input"
            />
            <span class="field-error" *ngIf="driverForm.get('firstName')?.invalid && driverForm.get('firstName')?.touched">
              First name is required
            </span>
          </div>

          <!-- Last Name -->
          <div class="form-group">
            <label class="form-label">Last Name <span class="required">*</span></label>
            <input 
              type="text" 
              formControlName="lastName" 
              placeholder="e.g. Doe"
              class="custom-input"
            />
            <span class="field-error" *ngIf="driverForm.get('lastName')?.invalid && driverForm.get('lastName')?.touched">
              Last name is required
            </span>
          </div>

          <!-- License Number -->
          <div class="form-group full-width">
            <label class="form-label">License Number <span class="required">*</span></label>
            <input 
              type="text" 
              formControlName="licenseNumber" 
              placeholder="e.g. DL-987654321"
              class="custom-input"
            />
            <span class="field-error" *ngIf="driverForm.get('licenseNumber')?.invalid && driverForm.get('licenseNumber')?.touched">
              License number is required
            </span>
          </div>

          <!-- Phone Number -->
          <div class="form-group full-width">
            <label class="form-label">Phone Number</label>
            <input 
              type="text" 
              formControlName="phoneNumber" 
              placeholder="e.g. +1 (555) 234-5678"
              class="custom-input"
            />
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="dialog-footer">
          <button type="button" class="btn-cancel" mat-dialog-close>Cancel</button>
          <button type="submit" class="btn-submit" [disabled]="driverForm.invalid || isSubmitting">
            <mat-spinner *ngIf="isSubmitting" diameter="18"></mat-spinner>
            <span>{{ isSubmitting ? 'Onboarding...' : 'Onboard Driver' }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .custom-dialog-card {
      background: #1E293B;
      color: #F8FAFC;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      max-width: 540px;
      width: 100%;
      margin: 0 auto;
      font-family: 'Inter', sans-serif;
    }

    .dialog-header {
      padding: 1.5rem 1.75rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(20, 184, 166, 0.05));
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .dialog-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
    }

    .dialog-subtitle {
      font-size: 0.85rem;
      color: #94A3B8;
      margin: 4px 0 0 0;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94A3B8;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
    }

    .dialog-body {
      padding: 1.75rem;
    }

    .error-alert {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #FCA5A5;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: span 2;
    }

    .form-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #CBD5E1;
      margin-bottom: 0.5rem;
    }

    .required {
      color: #F43F5E;
    }

    .custom-input {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      color: #FFFFFF;
      font-size: 0.925rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .custom-input:focus {
      border-color: #6366F1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .field-error {
      color: #F87171;
      font-size: 0.75rem;
      margin-top: 4px;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #94A3B8;
      padding: 0.65rem 1.25rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }

    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #FFFFFF;
    }

    .btn-submit {
      background: linear-gradient(135deg, #6366F1, #4F46E5);
      border: none;
      color: #FFFFFF;
      padding: 0.65rem 1.5rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
      transition: opacity 0.2s, transform 0.1s;
    }

    .btn-submit:hover:not(:disabled) {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
  `]
})
export class AddDriverDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddDriverDialogComponent>);
  private driverService = inject(DriverService);

  isSubmitting = false;
  errorMessage = '';

  driverForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    licenseNumber: ['', Validators.required],
    phoneNumber: ['']
  });

  onSubmit(): void {
    if (this.driverForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.driverService.onboardDriver(this.driverForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.dialogRef.close(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to onboard driver. Please try again.';
      }
    });
  }
}
