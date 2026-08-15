import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { TripService } from '../../../core/services/trip.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { DriverService } from '../../../core/services/driver.service';
import { RouteResponse, TripRequest, TripResponse } from '../../../core/models/trip.model';
import { VehicleResponse } from '../../../core/models/vehicle.model';
import { DriverResponse } from '../../../core/models/driver.model';

@Component({
  selector: 'app-add-trip-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-header">
      <div class="flex-row gap-3">
        <div class="icon-container">
          <mat-icon>{{ isEditMode ? 'edit' : 'route' }}</mat-icon>
        </div>
        <div>
          <h2 class="dialog-title">{{ isEditMode ? 'Edit Trip' : 'Schedule Trip' }}</h2>
          <p class="dialog-subtitle">{{ isEditMode ? 'Update trip details' : 'Dispatch a new trip' }}</p>
        </div>
      </div>
      <button mat-icon-button mat-dialog-close class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    @if (loadingDeps) {
      <div class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading data...</p>
      </div>
    } @else {
      <form [formGroup]="tripForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          @if (error) {
            <div class="error-banner">
              <mat-icon>error_outline</mat-icon>
              <span>{{ error }}</span>
            </div>
          }

          <!-- Route -->
          <mat-form-field appearance="outline" class="w-full form-field-dark">
            <mat-label>Route</mat-label>
            <mat-select formControlName="routeId">
              @for (route of routes; track route.id) {
                <mat-option [value]="route.id">{{ route.name }}</mat-option>
              }
            </mat-select>
            @if (routes.length === 0) {
              <mat-hint>No routes available. Create a route first in the Routes tab.</mat-hint>
            }
            <mat-error>Route is required</mat-error>
          </mat-form-field>

          <!-- Vehicle -->
          <mat-form-field appearance="outline" class="w-full form-field-dark">
            <mat-label>Vehicle</mat-label>
            <mat-select formControlName="vehicleId">
              @for (vehicle of vehicles; track vehicle.id) {
                <mat-option [value]="vehicle.id">
                  {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }} &mdash; {{ vehicle.registrationPlate }}
                </mat-option>
              }
            </mat-select>
            @if (vehicles.length === 0) {
              <mat-hint>No vehicles found. Add vehicles in the Fleet section.</mat-hint>
            }
            <mat-error>Vehicle is required</mat-error>
          </mat-form-field>

          <!-- Driver -->
          <mat-form-field appearance="outline" class="w-full form-field-dark">
            <mat-label>Driver</mat-label>
            <mat-select formControlName="driverId">
              @for (driver of drivers; track driver.id) {
                <mat-option [value]="driver.id">
                  {{ driver.firstName }} {{ driver.lastName }} ({{ driver.licenseNumber }})
                </mat-option>
              }
            </mat-select>
            @if (drivers.length === 0) {
              <mat-hint>No drivers found. Onboard drivers first.</mat-hint>
            }
            <mat-error>Driver is required</mat-error>
          </mat-form-field>

          <!-- Date & Time row -->
          <div class="two-col">
            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="startDate">
              <mat-hint>MM/DD/YYYY</mat-hint>
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error>Start date is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Start Time (HH:MM)</mat-label>
              <input matInput formControlName="startTime" placeholder="09:00">
              <mat-error>Time is required (HH:MM)</mat-error>
            </mat-form-field>
          </div>

          <!-- Status (edit mode only) -->
          @if (isEditMode) {
            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="SCHEDULED">🕐 Scheduled</mat-option>
                <mat-option value="ACTIVE">🟢 Active (In-Progress)</mat-option>
                <mat-option value="COMPLETED">✅ Completed</mat-option>
                <mat-option value="CANCELLED">❌ Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          }
        </div>

        <div class="dialog-actions">
          <button mat-button type="button" mat-dialog-close class="btn-cancel">Cancel</button>
          <button mat-flat-button type="submit"
            [disabled]="tripForm.invalid || isLoading"
            class="btn-submit">
            @if (isLoading) {
              <mat-spinner diameter="20" style="display:inline-block;margin-right:8px;"></mat-spinner>
              Saving...
            } @else {
              {{ isEditMode ? 'Save Changes' : 'Schedule Trip' }}
            }
          </button>
        </div>
      </form>
    }
  `,
  styles: [`
    .dialog-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .flex-row {
      display: flex;
      align-items: center;
    }
    .gap-3 { gap: 0.75rem; }
    .icon-container {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
      color: #a78bfa;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dialog-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary, #f1f5f9);
    }
    .dialog-subtitle {
      margin: 2px 0 0 0;
      font-size: 0.8rem;
      color: var(--text-secondary, #94a3b8);
    }
    .close-btn { color: var(--text-secondary, #94a3b8); }

    .loading-state {
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-secondary, #94a3b8);
    }

    .dialog-content {
      padding: 1.5rem;
      max-height: 65vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .w-full { width: 100%; }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-cancel {
      color: var(--text-secondary, #94a3b8);
      border-radius: 8px;
    }

    .btn-submit {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border-radius: 8px;
      padding: 0 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
  `]
})
export class AddTripDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tripService = inject(TripService);
  private vehicleService = inject(VehicleService);
  private driverService = inject(DriverService);
  private dialogRef = inject(MatDialogRef<AddTripDialogComponent>);

  tripForm!: FormGroup;
  isLoading = false;
  loadingDeps = true;
  error = '';
  isEditMode = false;
  tripId?: string;

  routes: RouteResponse[] = [];
  vehicles: VehicleResponse[] = [];
  drivers: DriverResponse[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { trip?: TripResponse } | null) {
    this.isEditMode = !!data?.trip;
    this.tripId = data?.trip?.id;

    let defaultDate = new Date();
    let defaultTime = '09:00';

    if (this.isEditMode && data?.trip?.scheduledStartTime) {
      const dt = new Date(data.trip.scheduledStartTime);
      defaultDate = dt;
      defaultTime = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
    }

    this.tripForm = this.fb.group({
      routeId:   [data?.trip?.routeId   || '', Validators.required],
      vehicleId: [data?.trip?.vehicleId || '', Validators.required],
      driverId:  [data?.trip?.driverId  || '', Validators.required],
      startDate: [defaultDate, Validators.required],
      startTime: [defaultTime, [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
      status:    [data?.trip?.status   || 'SCHEDULED']
    });
  }

  ngOnInit(): void {
    this.loadDependencies();
  }

  loadDependencies(): void {
    this.loadingDeps = true;
    forkJoin({
      routes:   this.tripService.getRoutes(),
      vehicles: this.vehicleService.getVehicles(),
      drivers:  this.driverService.getDrivers()
    }).subscribe({
      next: ({ routes, vehicles, drivers }) => {
        this.routes   = routes;
        this.vehicles = vehicles;
        this.drivers  = drivers;
        this.loadingDeps = false;
      },
      error: (err: any) => {
        console.error('Error loading dialog dependencies', err);
        this.error = 'Failed to load data. Please close and try again.';
        this.loadingDeps = false;
      }
    });
  }

  onSubmit(): void {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';

    const { routeId, vehicleId, driverId, startDate, startTime, status } = this.tripForm.value;

    // Combine date + time into local ISO string (no timezone suffix — matches Java LocalDateTime)
    const dateObj = new Date(startDate);
    const [hours, minutes] = (startTime as string).split(':');
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Format as yyyy-MM-ddTHH:mm:ss (local time, no 'Z') for Java LocalDateTime compatibility
    const pad = (n: number) => n.toString().padStart(2, '0');
    const localIso = `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:00`;

    const request: TripRequest = {
      routeId,
      vehicleId,
      driverId,
      scheduledStartTime: localIso,
      status: this.isEditMode ? status : 'SCHEDULED'
    };

    const operation = this.isEditMode
      ? this.tripService.updateTrip(this.tripId!, request)
      : this.tripService.scheduleTrip(request);

    operation.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: any) => {
        this.error = err.error?.message || 'An unexpected error occurred. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
