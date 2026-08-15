import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { TripService } from '../../core/services/trip.service';
import { TripResponse } from '../../core/models/trip.model';
import { AddTripDialogComponent } from './components/add-trip-dialog/add-trip-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTabsModule,
    DatePipe
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Trip Management</h1>
        <p class="page-subtitle">Schedule and dispatch enterprise trips</p>
      </div>
      <button mat-flat-button class="btn-primary" (click)="openAddTripDialog()">
        Schedule Trip
      </button>
    </div>

    <div class="table-container glass-panel">
      @if (isLoading) {
        <div class="loading-shade">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <mat-tab-group (selectedTabChange)="onTabChange($event.index)" animationDuration="0ms">
        <mat-tab label="All Trips">
          <table mat-table [dataSource]="filteredTrips" class="w-full mt-4">
            
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let element">
                <span class="status-badge" [ngClass]="element.status.toLowerCase()">
                  {{ element.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="scheduledTime">
              <th mat-header-cell *matHeaderCellDef> Scheduled Start </th>
              <td mat-cell *matCellDef="let element"> {{ element.scheduledStartTime | date:'medium' }} </td>
            </ng-container>

            <ng-container matColumnDef="routeId">
              <th mat-header-cell *matHeaderCellDef> Route ID </th>
              <td mat-cell *matCellDef="let element" class="text-secondary text-sm"> {{ element.routeId }} </td>
            </ng-container>
            
            <ng-container matColumnDef="vehicleId">
              <th mat-header-cell *matHeaderCellDef> Vehicle ID </th>
              <td mat-cell *matCellDef="let element" class="text-secondary text-sm"> {{ element.vehicleId }} </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right"> Actions </th>
              <td mat-cell *matCellDef="let element" class="text-right">
                <button mat-icon-button color="primary" (click)="openEditTripDialog(element)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteTrip(element.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell text-center py-8 text-secondary" colspan="5">
                No trips found. Schedule a new trip to get started.
              </td>
            </tr>
          </table>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .status-badge.scheduled { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
    .status-badge.active { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
    .status-badge.completed { background: rgba(107, 114, 128, 0.1); color: #9ca3af; border: 1px solid rgba(107, 114, 128, 0.2); }
    .status-badge.cancelled { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
  `]
})
export class TripsComponent implements OnInit {
  private tripService = inject(TripService);
  private dialog = inject(MatDialog);
  
  displayedColumns: string[] = ['status', 'scheduledTime', 'routeId', 'vehicleId', 'actions'];
  trips: TripResponse[] = [];
  filteredTrips: TripResponse[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.isLoading = true;
    this.tripService.getAllTrips().subscribe({
      next: (data) => {
        this.trips = data;
        this.filteredTrips = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching trips', err);
        this.isLoading = false;
      }
    });
  }

  onTabChange(index: number): void {
    // Basic filtering logic if we added more tabs (e.g. Active, Completed)
    this.filteredTrips = this.trips;
  }

  openAddTripDialog(): void {
    const dialogRef = this.dialog.open(AddTripDialogComponent, {
      width: '600px',
      disableClose: true,
      panelClass: 'glass-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTrips();
      }
    });
  }

  openEditTripDialog(trip: TripResponse): void {
    const dialogRef = this.dialog.open(AddTripDialogComponent, {
      width: '600px',
      disableClose: true,
      panelClass: 'glass-dialog',
      data: { trip }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTrips();
      }
    });
  }

  deleteTrip(id: string): void {
    if (confirm('Are you sure you want to cancel and delete this trip?')) {
      this.tripService.deleteTrip(id).subscribe({
        next: () => this.loadTrips(),
        error: (err) => console.error('Error deleting trip', err)
      });
    }
  }
}
