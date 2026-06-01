package com.portfolio.service;

import com.portfolio.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final Optional<FirestoreContactService> firestoreContactService;
    private final EmailNotificationService emailNotificationService;
    private final boolean firebaseEnabled;

    public ContactService(
            @Autowired(required = false) FirestoreContactService firestoreContactService,
            EmailNotificationService emailNotificationService,
            @Value("${portfolio.firebase.enabled:false}") boolean firebaseEnabled) {
        this.firestoreContactService = Optional.ofNullable(firestoreContactService);
        this.emailNotificationService = emailNotificationService;
        this.firebaseEnabled = firebaseEnabled;
    }

    public void processContact(ContactRequest request)
            throws ExecutionException, InterruptedException {
        if (firebaseEnabled) {
            if (firestoreContactService.isEmpty()) {
                throw new IllegalStateException("Firebase is enabled but Firestore is not configured");
            }
            firestoreContactService.get().save(request);
        } else {
            log.warn("Firebase disabled; contact not persisted to Firestore");
        }

        emailNotificationService.sendNotification(request);
    }

    public boolean hasPersistence() {
        return firebaseEnabled && firestoreContactService.isPresent();
    }
}
