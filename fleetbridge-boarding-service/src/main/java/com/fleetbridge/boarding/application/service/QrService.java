package com.fleetbridge.boarding.application.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
public class QrService {

    /**
     * Generates a Base64 encoded PNG of a QR code containing a secure payload.
     */
    public String generateQrCodeForEmployee(UUID employeeId) {
        // In a real production system, this payload should be a signed JWT
        // with an expiration time so codes cannot be copied/stolen.
        // For our demo, we use a structured text payload.
        String payload = String.format("FLEETBRIDGE|EMP|%s", employeeId.toString());
        
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(payload, BarcodeFormat.QR_CODE, 250, 250);
            
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray(); 
            
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            log.error("Failed to generate QR code", e);
            throw new RuntimeException("QR Generation failed");
        }
    }
}
