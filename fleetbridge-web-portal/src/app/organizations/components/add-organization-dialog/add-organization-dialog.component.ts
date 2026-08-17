import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrgService } from '../../../core/services/org.service';
import { OrganizationResponse } from '../../../core/models/organization.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-add-organization-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-icon"><mat-icon>business</mat-icon></div>
        <div>
          <h2 class="dialog-title">{{ editOrg ? 'Edit Organization' : 'Add Organization' }}</h2>
          <p class="dialog-subtitle">{{ editOrg ? 'Update corporate client details' : 'Onboard a new corporate client' }}</p>
        </div>
        <button class="close-btn" mat-dialog-close><mat-icon>close</mat-icon></button>
      </div>

      <div class="dialog-body">
        @if (errorMessage) {
          <div class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form [formGroup]="orgForm" class="org-form">
          <div class="field-group">
            <label class="field-label">Organization Name <span class="required">*</span></label>
            <input class="field-input" formControlName="name" placeholder="e.g. Infosys Technologies">
            @if (orgForm.get('name')?.invalid && orgForm.get('name')?.touched) {
              <span class="field-error">Name is required</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">Email Domain <span class="required">*</span></label>
            <input class="field-input" formControlName="domain" placeholder="e.g. infosys.com">
            @if (orgForm.get('domain')?.invalid && orgForm.get('domain')?.touched) {
              <span class="field-error">Domain is required</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">Contact Email <span class="required">*</span></label>
            <input class="field-input" type="email" formControlName="contactEmail" placeholder="e.g. hr@infosys.com">
            @if (orgForm.get('contactEmail')?.invalid && orgForm.get('contactEmail')?.touched) {
              <span class="field-error">Valid email is required</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">Contact Phone</label>
            <input class="field-input" formControlName="contactPhone" placeholder="e.g. +91-80-12345678">
          </div>
        </form>
      </div>

      <div class="dialog-footer">
        <button class="btn-cancel" mat-dialog-close>Cancel</button>
        <button class="btn-submit" [disabled]="orgForm.invalid || isSubmitting" (click)="onSubmit()">
          @if (isSubmitting) {
            <mat-spinner diameter="18"></mat-spinner>
          }
          <span>{{ isSubmitting ? 'Saving...' : (editOrg ? 'Save Changes' : 'Add Organization') }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { background:#1E293B; color:#F1F5F9; border-radius:20px; border:1px solid rgba(255,255,255,0.08); width:520px; max-width:100%; box-shadow:0 25px 60px rgba(0,0,0,0.5); overflow:hidden; }
    .dialog-header { display:flex; align-items:center; gap:16px; padding:1.5rem 1.75rem; background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(99,102,241,0.08)); border-bottom:1px solid rgba(255,255,255,0.07); }
    .header-icon { width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg,#f59e0b,#d97706); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .header-icon mat-icon { color:white; font-size:26px; width:26px; height:26px; }
    .dialog-title { margin:0; font-size:1.2rem; font-weight:700; color:#F1F5F9; }
    .dialog-subtitle { margin:2px 0 0; font-size:0.8rem; color:#94A3B8; }
    .close-btn { margin-left:auto; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:8px; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; width:36px; height:36px; padding:0; transition:all .2s; }
    .close-btn:hover { background:rgba(255,255,255,0.1); color:#F1F5F9; }
    .dialog-body { padding:1.5rem 1.75rem; }
    .error-banner { display:flex; align-items:center; gap:10px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:.75rem 1rem; margin-bottom:1.25rem; color:#FCA5A5; font-size:.85rem; }
    .error-banner mat-icon { color:#EF4444; font-size:20px; width:20px; height:20px; }
    .org-form { display:flex; flex-direction:column; gap:1.1rem; }
    .field-group { display:flex; flex-direction:column; gap:6px; }
    .field-label { font-size:.78rem; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:.06em; }
    .required { color:#EF4444; }
    .field-input { width:100%; padding:.65rem .9rem; background:rgba(15,23,42,.6); border:1.5px solid rgba(255,255,255,.1); border-radius:10px; color:#F1F5F9; font-size:.95rem; font-family:inherit; transition:all .2s; outline:none; box-sizing:border-box; }
    .field-input::placeholder { color:#475569; }
    .field-input:focus { border-color:#f59e0b; background:rgba(245,158,11,.06); box-shadow:0 0 0 3px rgba(245,158,11,.15); }
    .field-error { font-size:.75rem; color:#EF4444; }
    .dialog-footer { display:flex; justify-content:flex-end; align-items:center; gap:12px; padding:1.25rem 1.75rem; background:rgba(15,23,42,.4); border-top:1px solid rgba(255,255,255,.07); }
    .btn-cancel { background:transparent; border:1.5px solid rgba(255,255,255,.12); border-radius:10px; color:#94A3B8; padding:.6rem 1.4rem; font-size:.9rem; font-weight:500; cursor:pointer; font-family:inherit; transition:all .2s; }
    .btn-cancel:hover { background:rgba(255,255,255,.05); color:#F1F5F9; }
    .btn-submit { display:flex; align-items:center; gap:8px; background:linear-gradient(135deg,#f59e0b,#d97706); border:none; border-radius:10px; color:white; padding:.65rem 1.6rem; font-size:.95rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .2s; box-shadow:0 4px 15px rgba(245,158,11,.35); }
    .btn-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 25px rgba(245,158,11,.5); }
    .btn-submit:disabled { opacity:.5; cursor:not-allowed; transform:none; }
  `]
})
export class AddOrganizationDialogComponent {
  private fb        = inject(FormBuilder);
  private orgService = inject(OrgService);
  private toast     = inject(ToastService);
  private dialogRef = inject(MatDialogRef<AddOrganizationDialogComponent>);
  private dialogData = inject<{ org?: OrganizationResponse }>(MAT_DIALOG_DATA, { optional: true });

  editOrg: OrganizationResponse | null = this.dialogData?.org ?? null;
  isSubmitting = false;
  errorMessage: string | null = null;

  orgForm: FormGroup = this.fb.group({
    name:         [this.editOrg?.name         ?? '', Validators.required],
    domain:       [this.editOrg?.domain       ?? '', Validators.required],
    contactEmail: [this.editOrg?.contactEmail ?? '', [Validators.required, Validators.email]],
    contactPhone: [this.editOrg?.contactPhone ?? ''],
  });

  onSubmit(): void {
    if (this.orgForm.invalid) { this.orgForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.errorMessage = null;

    const action$ = this.editOrg
      ? this.orgService.updateOrganization(this.editOrg.id, this.orgForm.value)
      : this.orgService.createOrganization(this.orgForm.value);

    action$.subscribe({
      next: () => {
        this.toast.success(this.editOrg ? 'Organization updated!' : 'Organization added successfully!');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Failed to save. Check backend connection.';
      }
    });
  }
}
