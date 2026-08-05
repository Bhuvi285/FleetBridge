import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleResponse } from '../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Fleet Vehicles</h1>
        <p class="page-subtitle">Manage your enterprise fleet assets</p>
      </div>
      <button mat-flat-button class="btn-primary" (click)="openAddVehicleDialog()">
        <mat-icon>add</mat-icon> Add Vehicle
      </button>
    </div>

    <div class="table-container glass-panel">
      @if (isLoading) {
        <div class="loading-shade">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <table mat-table [dataSource]="vehicles" class="fleet-table">
        
        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> Status </th>
          <td mat-cell *matCellDef="let element">
            <span class="status-badge" [ngClass]="element.status.toLowerCase()">
              {{ element.status }}
            </span>
          </td>
        </ng-container>

        <!-- License Plate Column -->
        <ng-container matColumnDef="licensePlate">
          <th mat-header-cell *matHeaderCellDef> License Plate </th>
          <td mat-cell *matCellDef="let element" class="font-bold"> 
            {{ element.licensePlate }} 
          </td>
        </ng-container>

        <!-- Make Model Column -->
        <ng-container matColumnDef="makeModel">
          <th mat-header-cell *matHeaderCellDef> Make & Model </th>
          <td mat-cell *matCellDef="let element"> 
            {{ element.year }} {{ element.make }} {{ element.model }}
          </td>
        </ng-container>

        <!-- Type Column -->
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef> Type </th>
          <td mat-cell *matCellDef="let element"> {{ element.type }} </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="text-right"> Actions </th>
          <td mat-cell *matCellDef="let element" class="text-right">
            <button mat-icon-button color="primary">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteVehicle(element.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
            @if (!isLoading) {
              <mat-icon class="empty-icon">directions_car</mat-icon>
              <h3>No vehicles found</h3>
              <p>Your fleet database is currently empty.</p>
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
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .page-subtitle {
      margin: 0.25rem 0 0 0;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white;
      border-radius: 8px;
      padding: 0 1.5rem;
      height: 44px;
      font-weight: 600;
    }

    .glass-panel {
      background: var(--surface-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-glass);
      border-radius: 16px;
      overflow: hidden;
      position: relative;
    }

    .table-container {
      min-height: 400px;
    }

    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.5);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }

    .fleet-table {
      width: 100%;
      background: transparent !important;
    }

    /* Override Material Table Styles for Dark Glass Theme */
    ::ng-deep .fleet-table .mat-mdc-header-row {
      background: rgba(255, 255, 255, 0.03);
    }

    ::ng-deep .fleet-table .mat-mdc-header-cell {
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border-glass);
    }

    ::ng-deep .fleet-table .mat-mdc-cell {
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-glass);
      font-size: 0.95rem;
    }

    ::ng-deep .fleet-table .mat-mdc-row:hover .mat-mdc-cell {
      background: rgba(255, 255, 255, 0.02);
    }

    .font-bold {
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .text-right {
      text-align: right !important;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .status-badge.available {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }
    
    .status-badge.on_trip {
      background: rgba(59, 130, 246, 0.15);
      color: var(--info);
    }

    .status-badge.maintenance {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
    }

    .status-badge.out_of_service {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger);
    }

    .empty-state {
      text-align: center;
      padding: 4rem !important;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1.25rem;
    }
  `]
})
export class VehiclesComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  
  displayedColumns: string[] = ['status', 'licensePlate', 'makeModel', 'type', 'actions'];
  vehicles: VehicleResponse[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching vehicles', err);
        this.isLoading = false;
        // In a real app, show a toast notification here
      }
    });
  }

  openAddVehicleDialog(): void {
    // Stub for now. We will add a MatDialog later.
    console.log('Open Add Vehicle Dialog');
  }

  deleteVehicle(id: string): void {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(id).subscribe({
        next: () => this.loadVehicles(),
        error: (err) => console.error('Error deleting vehicle', err)
      });
    }
  }
}
