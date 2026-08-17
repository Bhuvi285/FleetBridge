import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { OrgService } from '../core/services/org.service';
import { OrganizationResponse } from '../core/models/organization.model';
import { ToastService } from '../core/services/toast.service';
import { AddOrganizationDialogComponent } from './components/add-organization-dialog/add-organization-dialog.component';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Organizations</h1>
        <p class="page-subtitle">Manage corporate clients and their transport contracts</p>
      </div>
      <button class="btn-primary" (click)="openAddDialog()">
        <span>🏢</span> Add Organization
      </button>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div class="stat-chip active">
        <span class="chip-dot active-dot"></span>
        Active: {{ activeCount }}
      </div>
      <div class="stat-chip total">
        Total: {{ orgs.length }}
      </div>
    </div>

    <div class="table-container glass-panel">
      @if (isLoading) {
        <div class="loading-shade">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <table mat-table [dataSource]="orgs" class="data-table">

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
          <th mat-header-cell *matHeaderCellDef>Organization Name</th>
          <td mat-cell *matCellDef="let row" class="name-cell">
            <span class="org-icon">🏢</span>
            <span class="org-name">{{ row.name }}</span>
          </td>
        </ng-container>

        <!-- Domain -->
        <ng-container matColumnDef="domain">
          <th mat-header-cell *matHeaderCellDef>Email Domain</th>
          <td mat-cell *matCellDef="let row" class="mono-cell">{{ row.domain }}</td>
        </ng-container>

        <!-- Contact Email -->
        <ng-container matColumnDef="contactEmail">
          <th mat-header-cell *matHeaderCellDef>Contact Email</th>
          <td mat-cell *matCellDef="let row">{{ row.contactEmail }}</td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
          <td mat-cell *matCellDef="let row" class="text-right">
            <button mat-icon-button class="action-btn" (click)="openEditDialog(row)" title="Edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button class="action-btn delete" (click)="deleteOrg(row.id)" title="Delete">
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
                <span class="empty-icon">🏢</span>
                <h3>No organizations onboarded</h3>
                <p>Add your first corporate client to get started.</p>
                <button class="btn-primary" (click)="openAddDialog()">Add Organization</button>
              </div>
            }
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
    .page-title { margin:0; font-size:1.75rem; font-weight:700; color:var(--text-primary); }
    .page-subtitle { margin:.25rem 0 0; color:var(--text-secondary); font-size:.95rem; }
    .btn-primary { display:flex; align-items:center; gap:.5rem; background:linear-gradient(135deg,#f59e0b,#d97706); color:white; border:none; border-radius:10px; padding:.65rem 1.25rem; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .2s; font-family:inherit; }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 20px rgba(245,158,11,.4); }

    .stats-row { display:flex; gap:.75rem; margin-bottom:1.5rem; }
    .stat-chip { display:flex; align-items:center; gap:.5rem; padding:.35rem .9rem; border-radius:20px; font-size:.82rem; font-weight:600; }
    .stat-chip.active { background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.25); color:#34d399; }
    .stat-chip.total  { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:var(--text-secondary); }
    .active-dot { width:7px; height:7px; border-radius:50%; background:#34d399; }

    .glass-panel { background:rgba(255,255,255,.04); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden; position:relative; min-height:400px; }
    .loading-shade { position:absolute; inset:0; background:rgba(15,23,42,.5); z-index:10; display:flex; align-items:center; justify-content:center; }
    .data-table { width:100%; background:transparent !important; }
    ::ng-deep .data-table .mat-mdc-header-row { background:rgba(255,255,255,.03) !important; }
    ::ng-deep .data-table .mat-mdc-header-cell { color:var(--text-secondary) !important; font-size:.78rem; font-weight:600; text-transform:uppercase; letter-spacing:.06em; border-bottom:1px solid rgba(255,255,255,.08) !important; }
    ::ng-deep .data-table .mat-mdc-cell { color:var(--text-primary) !important; border-bottom:1px solid rgba(255,255,255,.04) !important; font-size:.9rem; }
    .table-row { transition:background .15s; }
    ::ng-deep .data-table .table-row:hover .mat-mdc-cell { background:rgba(245,158,11,.04) !important; }

    .name-cell { display:flex; align-items:center; gap:.6rem; font-weight:600; }
    .org-icon { font-size:1.1rem; }
    .org-name { color:var(--text-primary); }
    .mono-cell { font-family:monospace; font-size:.82rem; color:var(--text-secondary); }
    .text-right { text-align:right !important; }

    .status-badge { display:inline-block; padding:.25rem .7rem; border-radius:20px; font-size:.72rem; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
    .status-badge.active   { background:rgba(16,185,129,.15); color:#34d399; border:1px solid rgba(16,185,129,.25); }
    .status-badge.inactive { background:rgba(239,68,68,.15); color:#f87171; border:1px solid rgba(239,68,68,.25); }
    .status-badge.suspended { background:rgba(245,158,11,.15); color:#fcd34d; border:1px solid rgba(245,158,11,.25); }

    .action-btn { color:var(--text-secondary) !important; }
    .action-btn:hover { color:#818cf8 !important; }
    .action-btn.delete:hover { color:#f87171 !important; }

    .empty-state { text-align:center !important; padding:4rem 2rem !important; }
    .empty-content { display:flex; flex-direction:column; align-items:center; gap:.5rem; }
    .empty-icon { font-size:3rem; margin-bottom:.5rem; }
    .empty-content h3 { margin:.5rem 0 0; font-size:1.2rem; color:var(--text-primary); }
    .empty-content p { margin:0; font-size:.9rem; color:var(--text-secondary); }
    .empty-content .btn-primary { margin-top:.75rem; }
  `]
})
export class OrganizationsComponent implements OnInit {
  private orgService = inject(OrgService);
  private dialog     = inject(MatDialog);
  private toast      = inject(ToastService);

  displayedColumns = ['status', 'name', 'domain', 'contactEmail', 'actions'];
  orgs: OrganizationResponse[] = [];
  isLoading = true;

  get activeCount() {
    return this.orgs.filter(o => !o.status || o.status === 'ACTIVE').length;
  }

  ngOnInit(): void { this.loadOrgs(); }

  loadOrgs(): void {
    this.isLoading = true;
    this.orgService.getOrganizations().subscribe({
      next:  (data) => { this.orgs = data; this.isLoading = false; },
      error: (_err: unknown) => { console.error(_err); this.isLoading = false; }
    });
  }

  openAddDialog(): void {
    this.dialog.open(AddOrganizationDialogComponent, {
      width: '560px', disableClose: true, panelClass: 'glass-dialog'
    }).afterClosed().subscribe(result => { if (result) this.loadOrgs(); });
  }

  openEditDialog(org: OrganizationResponse): void {
    this.dialog.open(AddOrganizationDialogComponent, {
      width: '560px', disableClose: true, panelClass: 'glass-dialog', data: { org }
    }).afterClosed().subscribe(result => { if (result) this.loadOrgs(); });
  }

  deleteOrg(id: string): void {
    if (!confirm('Delete this organization? This action cannot be undone.')) return;
    this.orgService.deleteOrganization(id).subscribe({
      next:  () => { this.toast.success('Organization deleted.'); this.loadOrgs(); },
      error: (_err: unknown) => this.toast.error('Failed to delete organization.')
    });
  }
}
