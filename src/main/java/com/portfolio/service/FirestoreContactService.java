package com.portfolio.service;

import com.google.cloud.firestore.Firestore;
import com.portfolio.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@ConditionalOnBean(Firestore.class)
public class FirestoreContactService {

    private static final Logger log = LoggerFactory.getLogger(FirestoreContactService.class);
    private static final String COLLECTION = "contacts";

    private final Firestore firestore;

    public FirestoreContactService(Firestore firestore) {
        this.firestore = firestore;
    }

    public void save(ContactRequest request) throws ExecutionException, InterruptedException {
        Map<String, Object> data = new HashMap<>();
        data.put("name", request.getName().trim());
        data.put("email", request.getEmail().trim().toLowerCase());
        data.put("message", request.getMessage().trim());
        data.put("createdAt", com.google.cloud.Timestamp.now());
        data.put("read", false);

        firestore.collection(COLLECTION).add(data).get();
        log.info("Contact message saved to Firestore from {}", request.getEmail());
    }
}
