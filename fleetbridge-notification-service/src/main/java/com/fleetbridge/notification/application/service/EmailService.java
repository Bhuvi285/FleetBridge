package com.fleetbridge.notification.application.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Value("${sendgrid.api-key:dummy-key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email:noreply@fleetbridge.io}")
    private String fromEmail;

    public void sendEmail(String toEmail, String subject, String bodyText) {
        if ("dummy-key".equals(sendGridApiKey)) {
            log.warn("SendGrid API key not configured. Mocking email to {}: {}", toEmail, subject);
            return;
        }

        Email from = new Email(fromEmail, "FleetBridge Notifications");
        Email to = new Email(toEmail);
        Content content = new Content("text/plain", bodyText);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            log.info("📧 Sent email to {}. SendGrid response code: {}", toEmail, response.getStatusCode());
        } catch (Exception ex) {
            log.error("❌ Failed to send email via SendGrid", ex);
        }
    }
}
