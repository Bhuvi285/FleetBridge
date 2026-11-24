import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { BoardingService } from '../../core/services/boarding.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  template: `
    <div class="scanner-container">
      <div class="scanner-header">
        <h2>Scan Boarding Pass</h2>
        <p>Hold the passenger's QR code up to the camera</p>
      </div>

      <div class="camera-wrapper glass-panel">
        @if (!isMediaDevicesSupported) {
          <div class="scanner-msg error">
            <h3>Camera Blocked by Browser</h3>
            <p>Your browser blocked camera access because this site is not using HTTPS. If you are testing on a mobile device, please access the site using <b>localhost</b> on the PC instead, or use ngrok to get an HTTPS url.</p>
          </div>
        } @else if (hasPermission === false) {
          <div class="scanner-msg error">Camera permission denied! Please allow camera access in your browser settings.</div>
        } @else if (hasDevices === undefined) {
          <div class="scanner-msg">Requesting camera permissions...</div>
        } @else if (hasDevices === false) {
          <div class="scanner-msg error">No camera devices found!</div>
        } @else {
          <zxing-scanner
            [enable]="true"
            (camerasFound)="onCamerasFound($event)"
            (camerasNotFound)="onCamerasNotFound()"
            (permissionResponse)="onPermissionResponse($event)"
            (scanSuccess)="onScanSuccess($event)"
            [formats]="[barcodeFormat.QR_CODE]"
          ></zxing-scanner>
          
          <div class="scanner-overlay">
            <div class="scan-frame" [class.success]="scanStatus() === 'SUCCESS'" [class.error]="scanStatus() === 'ERROR'"></div>
          </div>
        }
      </div>

      <div class="scanner-footer">
        @if (isScanning()) {
          <div class="scan-loading">
            <div class="spinner"></div>
            <span>Validating...</span>
          </div>
        } @else if (scanStatus() === 'SUCCESS') {
          <div class="scan-result success">
            <span class="icon">✅</span>
            <span>Boarding Confirmed!</span>
          </div>
        } @else if (scanStatus() === 'ERROR') {
          <div class="scan-result error">
            <span class="icon">❌</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .scanner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem;
      color: var(--text-primary);
    }
    .scanner-header {
      text-align: center;
    }
    .scanner-header h2 {
      font-size: 1.4rem;
      margin: 0 0 0.5rem;
    }
    .scanner-header p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin: 0;
    }
    .camera-wrapper {
      position: relative;
      width: 100%;
      max-width: 400px;
      aspect-ratio: 1;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .glass-panel {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
    }
    .scanner-msg {
      padding: 2rem;
      text-align: center;
      color: var(--text-muted);
    }
    .scanner-msg.error {
      color: #ef4444;
    }
    
    /* Full height for ZXing component */
    zxing-scanner {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .scanner-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
    }
    .scan-frame {
      width: 60%;
      height: 60%;
      border: 2px dashed rgba(255,255,255,0.4);
      border-radius: 16px;
      transition: all 0.3s;
    }
    .scan-frame.success {
      border-color: #34d399;
      background: rgba(52, 211, 153, 0.1);
    }
    .scan-frame.error {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .scanner-footer {
      min-height: 60px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .scan-loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-secondary);
    }
    .spinner {
      width: 24px; height: 24px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #818cf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .scan-result {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 30px;
      font-weight: 600;
    }
    .scan-result.success {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .scan-result.error {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
  `]
})
export class QrScannerComponent {
  @Input() tripId!: string;

  barcodeFormat = BarcodeFormat;

  private boardingService = inject(BoardingService);
  private toast = inject(ToastService);

  isMediaDevicesSupported = !!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  hasDevices: boolean | undefined = undefined;
  hasPermission: boolean | undefined = undefined;
  
  isScanning = signal(false);
  scanStatus = signal<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  errorMessage = signal('');
  
  private lastScannedCode = '';

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.hasDevices = devices && devices.length > 0;
  }

  onCamerasNotFound(): void {
    this.hasDevices = false;
  }

  onPermissionResponse(permission: boolean): void {
    this.hasPermission = permission;
    if (!permission) {
      this.toast.error("Camera permission denied");
    }
  }

  onScanSuccess(qrPayload: string): void {
    if (this.isScanning() || qrPayload === this.lastScannedCode) {
      return; // Prevent duplicate rapid scans
    }

    // Vibrate device if supported
    if (navigator.vibrate) navigator.vibrate(100);

    this.isScanning.set(true);
    this.scanStatus.set('IDLE');
    this.lastScannedCode = qrPayload;

    this.boardingService.scanQrCode({ tripId: this.tripId, qrPayload }).subscribe({
      next: (res) => {
        this.isScanning.set(false);
        if (res.data.status === 'SUCCESS') {
          this.scanStatus.set('SUCCESS');
          this.toast.success('Boarding Confirmed!');
        } else {
          this.scanStatus.set('ERROR');
          this.errorMessage.set(res.data.message);
          this.toast.error(res.data.message);
        }
        
        // Reset after 3 seconds
        setTimeout(() => {
          this.scanStatus.set('IDLE');
          this.lastScannedCode = ''; // Allow scanning same person again if needed later
        }, 3000);
      },
      error: () => {
        this.isScanning.set(false);
        this.scanStatus.set('ERROR');
        this.errorMessage.set('Server error validating QR code.');
        
        setTimeout(() => {
          this.scanStatus.set('IDLE');
          this.lastScannedCode = '';
        }, 3000);
      }
    });
  }
}
