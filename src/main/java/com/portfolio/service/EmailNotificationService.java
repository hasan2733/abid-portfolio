package com.portfolio.service;

import com.portfolio.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final boolean mailEnabled;
    private final String notifyEmail;
    private final String fromEmail;

    public EmailNotificationService(
            JavaMailSender mailSender,
            @Value("${portfolio.mail.enabled:false}") boolean mailEnabled,
            @Value("${portfolio.notify-email:}") String notifyEmail,
            @Value("${portfolio.mail.from:}") String fromEmail) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
        this.notifyEmail = notifyEmail;
        this.fromEmail = fromEmail;
    }

    public void sendNotification(ContactRequest request) {
        if (!mailEnabled) {
            log.debug("Email notifications disabled; skipping");
            return;
        }

        if (notifyEmail == null || notifyEmail.isBlank()) {
            log.warn("portfolio.notify-email is not set; skipping email");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        if (fromEmail != null && !fromEmail.isBlank()) {
            message.setFrom(fromEmail);
        }
        message.setTo(notifyEmail);
        message.setSubject("Portfolio contact from " + request.getName());
        message.setText(buildBody(request));

        mailSender.send(message);
        log.info("Contact notification email sent to {}", notifyEmail);
    }

    private String buildBody(ContactRequest request) {
        return """
                New message from your portfolio website

                Name: %s
                Email: %s

                Message:
                %s
                """.formatted(
                request.getName().trim(),
                request.getEmail().trim(),
                request.getMessage().trim());
    }
}
