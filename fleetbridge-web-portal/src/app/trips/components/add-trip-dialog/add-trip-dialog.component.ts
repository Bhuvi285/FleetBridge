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

import { TripService } from '../../../../core/services/trip.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { DriverService } from '../../../../core/services/driver.service';
import { RouteResponse, TripRequest, TripResponse } from '../../../../core/models/trip.model';
import { VehicleResponse } from '../../../../core/models/vehicle.model';
import { DriverResponse } from '../../../../core/models/driver.model';

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
    MatNativeDateModule
  ],
  template: `
    <div class="dialog-header">
      <div class="flex items-center gap-3">
        <div class="icon-container">
          <mat-icon>{{ isEditMode ? 'edit' : 'route' }}</mat-icon>
        </div>
        <div>
          <h2 class="m-0 text-xl font-bold">{{ isEditMode ? 'Edit Trip' : 'Schedule Trip' }}</h2>
          <p class="text-sm text-secondary m-0">{{ isEditMode ? 'Update trip details' : 'Dispatch a new trip' }}</p>
        </div>
      </div>
      <button mat-icon-button mat-dialog-close class="text-secondary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="tripForm" (ngSubmit)="onSubmit()">
      <div class="dialog-content">
        @if (error) {
          <div class="error-banner mb-4">
            <mat-icon class="text-red-400 mr-2">error</mat-icon>
            {{ error }}
          </div>
        }

        <div class="grid grid-cols-1 gap-4">
          <mat-form-field appearance="outline" class="w-full form-field-dark">
            <mat-label>Route</mat-label>
            <mat-select formControlName="routeId">
              @for (route of routes; track route.id) {
                <mat-option [value]="route.id">{{ route.name }}</mat-option>
              }
            </mat-select>
            <mat-error *ngIf="tripForm.get('routeId')?.hasError('required')">Route is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full form-field-dark">
            <mat-label>Vehicle</mat-label>
            <mat-select formControlName="vehicleId">
              @for (vehicle of vehicles; track vehicle.id) {
                <mat-option [value]="vehicle.id">{{ vehicle.makeModel }} ({{ vehicle.licensePlate }})</mat-option>
              }
            </mat-select>
            <mat-error *ngIf="tripForm.get('vehicleId')?.hasError('required')">Vehicle is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full form-field-dark">
            <mat-label>Driver</mat-label>
            <mat-select formControlName="driverId">
              @for (driver of drivers; track driver.id) {
                <mat-option [value]="driver.id">{{ driver.firstName }} {{ driver.lastName }}</mat-option>
              }
            </mat-select>
            <mat-error *ngIf="tripForm.get('driverId')?.hasError('required')">Driver is required</mat-error>
          </mat-form-field>

          <div class="grid grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="startDate">
              <mat-hint>MM/DD/YYYY</mat-hint>
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="tripForm.get('startDate')?.hasError('required')">Start Date is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Start Time (HH:MM)</mat-label>
              <input matInput formControlName="startTime" placeholder="09:00">
              <mat-error *ngIf="tripForm.get('startTime')?.hasError('required')">Start Time is required</mat-error>
            </mat-form-field>
          </div>
          
          @if (isEditMode) {
            <mat-form-field appearance="outline" class="w-full form-field-dark mt-2">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="SCHEDULED">Scheduled</mat-option>
                <mat-option value="ACTIVE">Active (In-Progress)</mat-option>
                <mat-option value="COMPLETED">Completed</mat-option>
                <mat-option value="CANCELLED">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          }
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button type="button" mat-dialog-close class="btn-secondary">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="tripForm.invalid || isLoading" class="btn-primary">
          {{ isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Schedule Trip') }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .dialog-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .icon-container {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dialog-content {
      padding: 1.5rem;
      max-height: 60vh;
      overflow-y: auto;
    }
    .dialog-actions {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .error-banner {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
    }
  `]
})
export class AddTripDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tripService = inject(TripService);
  private vehicleService = inject(VehicleService);
  private driverService = inject(DriverService);
  private dialogRef = inject(MatDialogRef<AddTripDialogComponent>);

  tripForm: FormGroup;
  isLoading = false;
  error = '';
  isEditMode = false;
  tripId?: string;

  routes: RouteResponse[] = [];
  vehicles: VehicleResponse[] = [];
  drivers: DriverResponse[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { trip?: TripResponse }) {
    this.isEditMode = !!data?.trip;
    this.tripId = data?.trip?.id;
    
    // Convert backend ISO string to Date object and time string
    let defaultDate = new Date();
    let defaultTime = '09:00';
    
    if (this.isEditMode && data?.trip?.scheduledStartTime) {
      const dt = new Date(data.trip.scheduledStartTime);
      defaultDate = dt;
      const hours = dt.getHours().toString().padStart(2, '0');
      const mins = dt.getMinutes().toString().padStart(2, '0');
      defaultTime = `${hours}:${mins}`;
    }

    this.tripForm = this.fb.group({
      routeId: [data?.trip?.routeId || '', Validators.required],
      vehicleId: [data?.trip?.vehicleId || '', Validators.required],
      driverId: [data?.trip?.driverId || '', Validators.required],
      startDate: [defaultDate, Validators.required],
      startTime: [defaultTime, Validators.required],
      status: [data?.trip?.status || 'SCHEDULED']
    });
  }

  ngOnInit(): void {
    this.loadDependencies();
  }

  loadDependencies(): void {
    // Load routes
    this.tripService.getRoutes().subscribe(data => {
      this.routes = data;
      // If we don't have routes, maybe we should create a dummy one for MVP
      if (this.routes.length === 0) {
        this.createDummyRoute();
      }
    });

    // Load vehicles
    this.vehicleService.getVehicles().subscribe(data => this.vehicles = data);

    // Load drivers
    this.driverService.getDrivers().subscribe(data => this.drivers = data);
  }

  createDummyRoute(): void {
    const dummyReq = {
      organizationId: '9b5adce4-58c2-4687-8849-439554104fd1', // Fallback UUID
      name: 'Default City Route'
    };
    this.tripService.createRoute(dummyReq).subscribe(route => {
      this.routes = [route];
      if (!this.isEditMode) {
        this.tripForm.patchValue({ routeId: route.id });
      }
    });
  }

  onSubmit(): void {
    if (this.tripForm.invalid) return;

    this.isLoading = true;
    this.error = '';

    const formValues = this.tripForm.value;
    
    // Combine Date and Time into ISO string
    const dateObj = new Date(formValues.startDate);
    const [hours, minutes] = formValues.startTime.split(':');
    dateObj.setHours(parseInt(hours, 10));
    dateObj.setMinutes(parseInt(minutes, 10));
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);

    const request: TripRequest = {
      routeId: formValues.routeId,
      vehicleId: formValues.vehicleId,
      driverId: formValues.driverId,
      scheduledStartTime: dateObj.toISOString(),
      status: this.isEditMode ? formValues.status : 'SCHEDULED'
    };

    const operation = this.isEditMode
      ? this.tripService.updateTrip(this.tripId!, request)
      : this.tripService.scheduleTrip(request);

    operation.subscribe({
      next: (response) => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred while saving the trip';
        this.isLoading = false;
      }
    });
  }
}
