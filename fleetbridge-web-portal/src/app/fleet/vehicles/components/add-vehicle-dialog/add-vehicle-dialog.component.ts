import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleService } from '../../../../core/services/vehicle.service';

@Component({
  selector: 'app-add-vehicle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">

      <!-- Header -->
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>directions_car</mat-icon>
        </div>
        <div>
          <h2 class="dialog-title">Add New Vehicle</h2>
          <p class="dialog-subtitle">Register a new vehicle to your fleet</p>
        </div>
        <button class="close-btn" mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form Body -->
      <div class="dialog-body">
        <div *ngIf="errorMessage" class="error-banner">
          <mat-icon>error_outline</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <form [formGroup]="vehicleForm" class="vehicle-form">

          <div class="form-row">
            <div class="field-group">
              <label class="field-label">License Plate <span class="required">*</span></label>
              <input class="field-input" formControlName="registrationPlate" placeholder="e.g. TN-01-AB-1234">
              <span class="field-error" *ngIf="vehicleForm.get('registrationPlate')?.invalid && vehicleForm.get('registrationPlate')?.touched">
                License plate is required
              </span>
            </div>

            <div class="field-group">
              <label class="field-label">Vehicle Type <span class="required">*</span></label>
              <select class="field-input field-select" formControlName="type">
                <option value="BUS">Bus</option>
                <option value="VAN">Van</option>
                <option value="CAR">Car</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Make <span class="required">*</span></label>
              <input class="field-input" formControlName="make" placeholder="e.g. Mercedes-Benz">
              <span class="field-error" *ngIf="vehicleForm.get('make')?.invalid && vehicleForm.get('make')?.touched">
                Make is required
              </span>
            </div>

            <div class="field-group">
              <label class="field-label">Model <span class="required">*</span></label>
              <input class="field-input" formControlName="model" placeholder="e.g. Sprinter">
              <span class="field-error" *ngIf="vehicleForm.get('model')?.invalid && vehicleForm.get('model')?.touched">
                Model is required
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Year <span class="required">*</span></label>
              <input class="field-input" type="number" formControlName="year" placeholder="e.g. 2024" min="1990" max="2030">
            </div>

            <div class="field-group">
              <label class="field-label">Seating Capacity <span class="required">*</span></label>
              <input class="field-input" type="number" formControlName="seatingCapacity" placeholder="e.g. 12" min="1">
            </div>
          </div>

        </form>
      </div>

      <!-- Footer Actions -->
      <div class="dialog-footer">
        <button class="btn-cancel" mat-dialog-close>Cancel</button>
        <button class="btn-submit" [disabled]="vehicleForm.invalid || isSubmitting" (click)="onSubmit()">
          <mat-spinner *ngIf="isSubmitting" diameter="18"></mat-spinner>
          <span>{{ isSubmitting ? 'Adding...' : 'Add Vehicle' }}</span>
        </button>
      </div>

    </div>
  `,
  styles: [`
    .dialog-container {
      background: #1E293B;
      color: #F1F5F9;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
      width: 560px;
      max-width: 100%;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    }

    /* ---- Header ---- */
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 1.5rem 1.75rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(45, 212, 191, 0.08));
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6366F1, #2DD4BF);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-icon mat-icon {
      color: white;
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #F1F5F9;
    }

    .dialog-subtitle {
      margin: 2px 0 0 0;
      font-size: 0.8rem;
      color: #94A3B8;
    }

    .close-btn {
      margin-left: auto;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      color: #94A3B8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #F1F5F9;
    }

    /* ---- Body ---- */
    .dialog-body {
      padding: 1.5rem 1.75rem;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.25rem;
      color: #FCA5A5;
      font-size: 0.85rem;
    }

    .error-banner mat-icon {
      color: #EF4444;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .vehicle-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .field-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .required {
      color: #EF4444;
    }

    .field-input {
      width: 100%;
      padding: 0.65rem 0.9rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #F1F5F9;
      font-size: 0.95rem;
      font-family: 'Inter', -apple-system, sans-serif;
      transition: all 0.2s ease;
      outline: none;
      box-sizing: border-box;
    }

    .field-input::placeholder {
      color: #475569;
    }

    .field-input:focus {
      border-color: #6366F1;
      background: rgba(99, 102, 241, 0.06);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .field-input:hover:not(:focus) {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .field-select {
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 2.5rem;
    }

    .field-select option {
      background: #1E293B;
      color: #F1F5F9;
    }

    .field-error {
      font-size: 0.75rem;
      color: #EF4444;
    }

    /* ---- Footer ---- */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      padding: 1.25rem 1.75rem;
      background: rgba(15, 23, 42, 0.4);
      border-top: 1px solid rgba(255, 255, 255, 0.07);
    }

    .btn-cancel {
      background: transparent;
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      color: #94A3B8;
      padding: 0.6rem 1.4rem;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #F1F5F9;
      border-color: rgba(255, 255, 255, 0.25);
    }

    .btn-submit {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #6366F1, #2DD4BF);
      border: none;
      border-radius: 10px;
      color: white;
      padding: 0.65rem 1.6rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-submit mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class AddVehicleDialogComponent {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private dialogRef = inject(MatDialogRef<AddVehicleDialogComponent>);

  isSubmitting = false;
  errorMessage: string | null = null;

  vehicleForm: FormGroup = this.fb.group({
    travelCompanyId: ['123e4567-e89b-12d3-a456-426614174000'],
    registrationPlate: ['', Validators.required],
    make: ['', Validators.required],
    model: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
    seatingCapacity: [4, [Validators.required, Validators.min(1)]],
    type: ['CAR', Validators.required],
    status: ['AVAILABLE']
  });

  onSubmit(): void {
    this.errorMessage = null;

    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.vehicleService.createVehicle(this.vehicleForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to create vehicle', err);
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || err?.message || 'Failed to create vehicle. Please check backend connection.';
      }
    });
  }
}
