import { Component, Inject, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BoardingService, ApiResponse } from '../../../core/services/boarding.service';
import { EmployeeResponse } from '../../../core/models/organization.model';

@Component({
  selector: 'app-employee-qr-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="qr-dialog-container">
      <h2 mat-dialog-title>Boarding Pass</h2>
      
      <div class="dialog-content" mat-dialog-content>
        <div class="emp-info">
          <h3>{{ data.firstName }} {{ data.lastName }}</h3>
          <p>{{ data.email }}</p>
        </div>

        <div class="qr-wrapper">
          @if (isLoading()) {
            <mat-spinner diameter="40"></mat-spinner>
          } @else if (error()) {
            <div class="error-msg">
              <span>⚠️</span>
              <p>Failed to generate QR code.</p>
              <button mat-button color="primary" (click)="loadQr()">Retry</button>
            </div>
          } @else if (qrCodeUrl()) {
            <img [src]="qrCodeUrl()" alt="Boarding Pass QR Code" class="qr-image" />
          }
        </div>
        
        <p class="scan-instruction">Show this QR code to the driver when boarding the bus.</p>
      </div>

      <div mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button mat-dialog-close>Close</button>
        <button mat-flat-button color="primary" [disabled]="!qrCodeUrl()" (click)="printQr()">
          Print
        </button>
      </div>
    </div>
  `,
  styles: [`
    .qr-dialog-container {
      background: var(--bg-surface, #1e293b);
      color: var(--text-primary, #f8fafc);
      padding: 1rem;
    }
    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 1rem;
    }
    .dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 0 !important;
    }
    .emp-info {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .emp-info h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.25rem;
    }
    .emp-info p {
      margin: 0;
      color: var(--text-secondary, #94a3b8);
      font-size: 0.9rem;
    }
    .qr-wrapper {
      width: 250px;
      height: 250px;
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      padding: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .qr-image {
      max-width: 100%;
      max-height: 100%;
      display: block;
    }
    .scan-instruction {
      text-align: center;
      color: var(--text-muted, #64748b);
      font-size: 0.85rem;
      max-width: 280px;
      margin: 0;
    }
    .error-msg {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #ef4444;
      text-align: center;
    }
    .error-msg span { font-size: 2rem; }
    .dialog-actions {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 1rem !important;
      margin-bottom: 0 !important;
    }
  `]
})
export class EmployeeQrDialogComponent implements OnInit {
  private boardingService = inject(BoardingService);

  isLoading = signal(true);
  error = signal(false);
  qrCodeUrl = signal<string | null>(null);

  constructor(
    public dialogRef: MatDialogRef<EmployeeQrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeeResponse
  ) {}

  ngOnInit(): void {
    this.loadQr();
  }

  loadQr(): void {
    this.isLoading.set(true);
    this.error.set(false);
    
    this.boardingService.getEmployeeQrCode(this.data.id).subscribe({
      next: (res: ApiResponse<{qrCodeDataUrl: string}>) => {
        this.qrCodeUrl.set(res.data.qrCodeDataUrl);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.isLoading.set(false);
      }
    });
  }

  printQr(): void {
    if (!this.qrCodeUrl()) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Boarding Pass - ${this.data.firstName} ${this.data.lastName}</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { border: 2px dashed #ccc; padding: 2rem; border-radius: 12px; text-align: center; }
              h1 { margin: 0 0 0.5rem; }
              p { color: #666; margin: 0 0 2rem; }
              img { width: 250px; height: 250px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>${this.data.firstName} ${this.data.lastName}</h1>
              <p>FleetBridge Corporate Transport</p>
              <img src="${this.qrCodeUrl()}" />
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}
