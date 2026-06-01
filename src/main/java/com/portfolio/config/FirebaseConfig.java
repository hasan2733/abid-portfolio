package com.portfolio.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${portfolio.firebase.credentials-path:}")
    private String credentialsPath;

    @Bean
    @ConditionalOnProperty(name = "portfolio.firebase.enabled", havingValue = "true")
    public Firestore firestore() throws IOException {
        if (!StringUtils.hasText(credentialsPath)) {
            throw new IllegalStateException(
                    "portfolio.firebase.credentials-path must be set when Firebase is enabled");
        }

        try (InputStream serviceAccount = new FileInputStream(credentialsPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

            log.info("Firebase initialized successfully");
            return FirestoreClient.getFirestore();
        }
    }
}
