import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { TripService } from '../../../core/services/trip.service';
import { RouteRequest, RouteResponse } from '../../../core/models/trip.model';
import { environment } from '../../../../environments/environment';

interface OrgResponse {
  id: string;
  name: string;
  tenantId: string;
  industry: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Component({
  selector: 'app-add-route-dialog',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-header">
      <div class="flex-row gap-3">
        <div class="icon-container">
          <mat-icon>{{ isEditMode ? 'edit_road' : 'add_road' }}</mat-icon>
        </div>
        <div>
          <h2 class="dialog-title">{{ isEditMode ? 'Edit Route' : 'Create Route' }}</h2>
          <p class="dialog-subtitle">{{ isEditMode ? 'Update route details' : 'Define a new transport route' }}</p>
        </div>
      </div>
      <button mat-icon-button mat-dialog-close class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    @if (loadingOrgs) {
      <div class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading organizations...</p>
      </div>
    } @else {
      <form [formGroup]="routeForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          @if (error) {
            <div class="error-banner">
              <mat-icon>error_outline</mat-icon>
              <span>{{ error }}</span>
            </div>
          }

          <!-- Organization selector -->
          <mat-form-field appearance="outline" class="w-full form-field-dark">
            <mat-label>Organization</mat-label>
            <mat-select formControlName="organizationId">
              @for (org of organizations; track org.id) {
                <mat-option [value]="org.id">{{ org.name }}</mat-option>
              }
            </mat-select>
            @if (organizations.length === 0) {
              <mat-hint>No organizations found.</mat-hint>
            }
            <mat-error>Organization is required</mat-error>
          </mat-form-field>

          <!-- Route Name -->
          <mat-form-field appearance="outline" class="w-full form-field-dark">
            <mat-label>Route Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. City Center → Airport">
            <mat-icon matSuffix>route</mat-icon>
            <mat-error>Route name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="dialog-actions">
          <button mat-button type="button" mat-dialog-close class="btn-cancel">Cancel</button>
          <button mat-flat-button type="submit"
            [disabled]="routeForm.invalid || isLoading"
            class="btn-submit">
            @if (isLoading) {
              <mat-spinner diameter="20" style="display:inline-block;margin-right:8px;"></mat-spinner>
              Saving...
            } @else {
              {{ isEditMode ? 'Save Changes' : 'Create Route' }}
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
    .flex-row { display: flex; align-items: center; }
    .gap-3 { gap: 0.75rem; }
    .icon-container {
      width: 42px; height: 42px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.3));
      color: #34d399;
      display: flex; align-items: center; justify-content: center;
    }
    .dialog-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-primary, #f1f5f9); }
    .dialog-subtitle { margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-secondary, #94a3b8); }
    .close-btn { color: var(--text-secondary, #94a3b8); }
    .loading-state {
      padding: 3rem; display: flex; flex-direction: column;
      align-items: center; gap: 1rem; color: var(--text-secondary, #94a3b8);
    }
    .dialog-content {
      padding: 1.5rem; display: flex; flex-direction: column; gap: 0.25rem;
    }
    .w-full { width: 100%; }
    .dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex; justify-content: flex-end; gap: 0.75rem;
    }
    .btn-cancel { color: var(--text-secondary, #94a3b8); border-radius: 8px; }
    .btn-submit {
      background: linear-gradient(135deg, #10b981, #3b82f6);
      color: white; border-radius: 8px;
      padding: 0 1.5rem; font-weight: 600;
      display: flex; align-items: center;
    }
    .error-banner {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171; padding: 0.75rem 1rem;
      border-radius: 8px; font-size: 0.875rem; margin-bottom: 0.5rem;
    }
  `]
})
export class AddRouteDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private tripService = inject(TripService);
  private dialogRef = inject(MatDialogRef<AddRouteDialogComponent>);

  routeForm!: FormGroup;
  isLoading = false;
  loadingOrgs = true;
  error = '';
  isEditMode = false;
  routeId?: string;
  organizations: OrgResponse[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { route?: RouteResponse } | null) {
    this.isEditMode = !!data?.route;
    this.routeId = data?.route?.id;

    this.routeForm = this.fb.group({
      organizationId: [data?.route?.organizationId || '', Validators.required],
      name: [data?.route?.name || '', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.loadingOrgs = true;
    this.http.get<ApiResponse<OrgResponse[]>>(`${environment.apiBaseUrl}/api/v1/org/organizations`).pipe(
      map(res => res.data || [])
    ).subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        // Pre-select first org if creating new and none selected
        if (!this.isEditMode && orgs.length > 0 && !this.routeForm.value.organizationId) {
          this.routeForm.patchValue({ organizationId: orgs[0].id });
        }
        this.loadingOrgs = false;
      },
      error: (err: any) => {
        console.error('Failed to load organizations', err);
        // Non-blocking: user can still type org ID or we use the fallback
        this.loadingOrgs = false;
        this.error = 'Could not load organizations. You may still proceed if data is available.';
      }
    });
  }

  onSubmit(): void {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';

    const request: RouteRequest = {
      organizationId: this.routeForm.value.organizationId,
      name: this.routeForm.value.name.trim()
    };

    const operation = this.isEditMode
      ? this.tripService.updateRoute(this.routeId!, request)
      : this.tripService.createRoute(request);

    operation.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to save route. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
