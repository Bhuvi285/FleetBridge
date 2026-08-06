import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DriverService } from '../../core/services/driver.service';
import { DriverResponse } from '../../core/models/driver.model';
import { AddDriverDialogComponent } from './components/add-driver-dialog/add-driver-dialog.component';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Fleet Drivers</h1>
        <p class="page-subtitle">Manage authorized drivers and operating credentials</p>
      </div>
      <button mat-flat-button class="btn-primary" (click)="openAddDriverDialog()">
        Onboard Driver
      </button>
    </div>

    <div class="table-container glass-panel">
      @if (isLoading) {
        <div class="loading-shade">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <table mat-table [dataSource]="drivers" class="fleet-table">
        
        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> Status </th>
          <td mat-cell *matCellDef="let element">
            <span class="status-badge" [ngClass]="element.status ? element.status.toLowerCase() : 'active'">
              {{ element.status || 'ACTIVE' }}
            </span>
          </td>
        </ng-container>

        <!-- Driver Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Driver Name </th>
          <td mat-cell *matCellDef="let element" class="font-bold"> 
            {{ element.firstName }} {{ element.lastName }}
          </td>
        </ng-container>

        <!-- License Number Column -->
        <ng-container matColumnDef="licenseNumber">
          <th mat-header-cell *matHeaderCellDef> License Number </th>
          <td mat-cell *matCellDef="let element"> 
            {{ element.licenseNumber }}
          </td>
        </ng-container>

        <!-- Phone Number Column -->
        <ng-container matColumnDef="phoneNumber">
          <th mat-header-cell *matHeaderCellDef> Phone Number </th>
          <td mat-cell *matCellDef="let element"> 
            {{ element.phoneNumber || 'N/A' }} 
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="text-right"> Actions </th>
          <td mat-cell *matCellDef="let element" class="text-right">
            <button mat-icon-button color="primary">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
            @if (!isLoading) {
              <mat-icon class="empty-icon">badge</mat-icon>
              <h3>No drivers onboarded</h3>
              <p>Your driver registry is currently empty.</p>
            }
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.25rem 0;
    }
    .page-subtitle {
      color: var(--text-secondary);
      margin: 0;
    }
    .btn-primary {
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: #fff;
      border-radius: 12px;
      padding: 0.6rem 1.5rem;
      font-weight: 600;
    }
    .table-container {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
    }
    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(15, 23, 42, 0.7);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fleet-table {
      width: 100%;
      background: transparent !important;
    }
    .font-bold {
      font-weight: 600;
      color: var(--text-primary);
    }
    .text-right {
      text-align: right;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-badge.active {
      background: rgba(34, 197, 94, 0.15);
      color: #4ADE80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .status-badge.on_trip {
      background: rgba(59, 130, 246, 0.15);
      color: #60A5FA;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .status-badge.inactive, .status-badge.suspended {
      background: rgba(239, 68, 68, 0.15);
      color: #F87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem !important;
      color: var(--text-muted);
    }
    .empty-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    .empty-state h3 {
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }
  `]
})
export class DriversComponent implements OnInit {
  private driverService = inject(DriverService);
  private dialog = inject(MatDialog);

  drivers: DriverResponse[] = [];
  displayedColumns: string[] = ['status', 'name', 'licenseNumber', 'phoneNumber', 'actions'];
  isLoading = true;

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.driverService.getDrivers().subscribe({
      next: (data) => {
        this.drivers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load drivers', err);
        this.isLoading = false;
      }
    });
  }

  openAddDriverDialog(): void {
    const dialogRef = this.dialog.open(AddDriverDialogComponent, {
      panelClass: 'glass-dialog',
      width: '560px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDrivers();
      }
    });
  }
}
