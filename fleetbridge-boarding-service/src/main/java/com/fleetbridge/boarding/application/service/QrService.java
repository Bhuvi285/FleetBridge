package com.fleetbridge.boarding.application.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrService {

    private final StringRedisTemplate redisTemplate;
    public static final Duration TOKEN_TTL = Duration.ofMinutes(15);
    public static final String REDIS_KEY_PREFIX = "boarding:token:";

    /**
     * Generates a dynamic Base64 encoded PNG QR code with a 15-minute TTL single-use token.
     */
    public String generateQrCodeForEmployee(UUID employeeId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        long timestamp = Instant.now().getEpochSecond();

        // Register dynamic token in Redis with 15-minute TTL
        try {
            String redisKey = REDIS_KEY_PREFIX + token;
            redisTemplate.opsForValue().set(redisKey, employeeId.toString(), TOKEN_TTL);
            log.info("Registered ephemeral boarding token for employeeId={} with 15m TTL", employeeId);
        } catch (Exception e) {
            log.warn("Redis unavailable for boarding token registration, proceeding with timestamped fallback: {}", e.getMessage());
        }

        // Format: FLEETBRIDGE|EMP|<employeeId>|<token>|<timestamp>
        String payload = String.format("FLEETBRIDGE|EMP|%s|%s|%d", employeeId.toString(), token, timestamp);
        
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(payload, BarcodeFormat.QR_CODE, 250, 250);
            
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray(); 
            
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            log.error("Failed to generate QR code", e);
            throw new RuntimeException("QR Generation failed", e);
        }
    }
}
