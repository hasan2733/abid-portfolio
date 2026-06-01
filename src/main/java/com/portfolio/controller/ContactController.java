package com.portfolio.controller;

import com.portfolio.dto.ContactRequest;
import com.portfolio.dto.ContactResponse;
import com.portfolio.service.ContactService;
import com.portfolio.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final ContactService contactService;
    private final RateLimitService rateLimitService;

    public ContactController(ContactService contactService, RateLimitService rateLimitService) {
        this.contactService = contactService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/contact")
    public ResponseEntity<ContactResponse> submitContact(
            @Valid @RequestBody ContactRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = resolveClientIp(httpRequest);

        if (!rateLimitService.isAllowed(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ContactResponse.error("Too many requests. Please try again later."));
        }

        try {
            contactService.processContact(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ContactResponse.ok("Thank you! Your message has been sent successfully."));
        } catch (IllegalStateException e) {
            log.error("Contact configuration error", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ContactResponse.error("Message service is temporarily unavailable."));
        } catch (ExecutionException | InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Failed to save contact", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ContactResponse.error("Unable to send your message. Please try again later."));
        } catch (Exception e) {
            log.error("Unexpected error processing contact", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ContactResponse.error("Unable to send your message. Please try again later."));
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
