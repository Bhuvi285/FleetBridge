import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { OrgService } from '../core/services/org.service';
import { EmployeeResponse } from '../core/models/organization.model';
import { ToastService } from '../core/services/toast.service';
import { AddEmployeeDialogComponent } from './components/add-employee-dialog/add-employee-dialog.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Employees</h1>
        <p class="page-subtitle">Manage the employees registered for corporate transportation</p>
      </div>
      <button class="btn-primary" (click)="openAddDialog()">
        <span>👤</span> Add Employee
      </button>
    </div>

    <div class="table-container glass-panel">
      @if (isLoading) {
        <div class="loading-shade"><mat-spinner diameter="40"></mat-spinner></div>
      }

      <table mat-table [dataSource]="employees" class="data-table">

        <!-- Status -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let row">
            <span class="status-badge" [ngClass]="(row.status || 'active').toLowerCase()">
              {{ row.status || 'ACTIVE' }}
            </span>
          </td>
        </ng-container>

        <!-- Name -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Full Name</th>
          <td mat-cell *matCellDef="let row" class="font-bold">
            {{ row.firstName }} {{ row.lastName }}
          </td>
        </ng-container>

        <!-- Email -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Work Email</th>
          <td mat-cell *matCellDef="let row">{{ row.email }}</td>
        </ng-container>

        <!-- Department -->
        <ng-container matColumnDef="department">
          <th mat-header-cell *matHeaderCellDef>Department</th>
          <td mat-cell *matCellDef="let row">{{ row.department || '—' }}</td>
        </ng-container>

        <!-- Phone -->
        <ng-container matColumnDef="phone">
          <th mat-header-cell *matHeaderCellDef>Phone</th>
          <td mat-cell *matCellDef="let row">{{ row.phoneNumber || '—' }}</td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
          <td mat-cell *matCellDef="let row" class="text-right">
            <button mat-icon-button class="action-btn" (click)="openEditDialog(row)" title="Edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button class="action-btn delete" (click)="deleteEmployee(row.id)" title="Delete">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="empty-state" [attr.colspan]="displayedColumns.length">
            @if (!isLoading) {
              <div class="empty-content">
                <span class="empty-icon">👥</span>
                <h3>No employees registered</h3>
                <p>Add employees who will use the transportation service.</p>
                <button class="btn-primary" (click)="openAddDialog()">Add Employee</button>
              </div>
            }
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    .page-title { margin:0; font-size:1.75rem; font-weight:700; color:var(--text-primary); }
    .page-subtitle { margin:.25rem 0 0; color:var(--text-secondary); font-size:.95rem; }
    .btn-primary { display:flex; align-items:center; gap:.5rem; background:linear-gradient(135deg,#10b981,#059669); color:white; border:none; border-radius:10px; padding:.65rem 1.25rem; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .2s; font-family:inherit; }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 20px rgba(16,185,129,.4); }
    .glass-panel { background:rgba(255,255,255,.04); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden; position:relative; min-height:400px; }
    .loading-shade { position:absolute; inset:0; background:rgba(15,23,42,.5); z-index:10; display:flex; align-items:center; justify-content:center; }
    .data-table { width:100%; background:transparent !important; }
    ::ng-deep .data-table .mat-mdc-header-row { background:rgba(255,255,255,.03) !important; }
    ::ng-deep .data-table .mat-mdc-header-cell { color:var(--text-secondary) !important; font-size:.78rem; font-weight:600; text-transform:uppercase; letter-spacing:.06em; border-bottom:1px solid rgba(255,255,255,.08) !important; }
    ::ng-deep .data-table .mat-mdc-cell { color:var(--text-primary) !important; border-bottom:1px solid rgba(255,255,255,.04) !important; font-size:.9rem; }
    .table-row { transition:background .15s; }
    ::ng-deep .data-table .table-row:hover .mat-mdc-cell { background:rgba(16,185,129,.04) !important; }
    .font-bold { font-weight:600; }
    .text-right { text-align:right !important; }
    .status-badge { display:inline-block; padding:.25rem .7rem; border-radius:20px; font-size:.72rem; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
    .status-badge.active   { background:rgba(16,185,129,.15); color:#34d399; border:1px solid rgba(16,185,129,.25); }
    .status-badge.inactive { background:rgba(239,68,68,.15); color:#f87171; border:1px solid rgba(239,68,68,.25); }
    .status-badge.on_leave { background:rgba(245,158,11,.15); color:#fcd34d; border:1px solid rgba(245,158,11,.25); }
    .action-btn { color:var(--text-secondary) !important; }
    .action-btn:hover { color:#34d399 !important; }
    .action-btn.delete:hover { color:#f87171 !important; }
    .empty-state { text-align:center !important; padding:4rem 2rem !important; }
    .empty-content { display:flex; flex-direction:column; align-items:center; gap:.5rem; }
    .empty-icon { font-size:3rem; margin-bottom:.5rem; }
    .empty-content h3 { margin:.5rem 0 0; font-size:1.2rem; color:var(--text-primary); }
    .empty-content p { margin:0; font-size:.9rem; color:var(--text-secondary); }
    .empty-content .btn-primary { margin-top:.75rem; }
  `]
})
export class EmployeesComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog     = inject(MatDialog);
  private toast      = inject(ToastService);

  displayedColumns = ['status', 'name', 'email', 'department', 'phone', 'actions'];
  employees: EmployeeResponse[] = [];
  isLoading = true;

  ngOnInit(): void { this.loadEmployees(); }

  loadEmployees(): void {
    this.isLoading = true;
    this.orgService.getEmployees().subscribe({
      next:  (data) => { this.employees = data; this.isLoading = false; },
      error: (err: unknown)  => { console.error(err); this.isLoading = false; }
    });
  }

  openAddDialog(): void {
    this.dialog.open(AddEmployeeDialogComponent, {
      width: '600px', disableClose: true, panelClass: 'glass-dialog'
    }).afterClosed().subscribe(result => { if (result) this.loadEmployees(); });
  }

  openEditDialog(employee: EmployeeResponse): void {
    this.dialog.open(AddEmployeeDialogComponent, {
      width: '600px', disableClose: true, panelClass: 'glass-dialog', data: { employee }
    }).afterClosed().subscribe(result => { if (result) this.loadEmployees(); });
  }

  deleteEmployee(id: string): void {
    if (!confirm('Remove this employee from the system?')) return;
    this.orgService.deleteEmployee(id).subscribe({
      next:  () => { this.toast.success('Employee removed.'); this.loadEmployees(); },
      error: (_err: unknown) => this.toast.error('Failed to remove employee.')
    });
  }
}
