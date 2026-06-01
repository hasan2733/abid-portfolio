package com.portfolio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final int limitPerHour;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimitService(@Value("${portfolio.contact.rate-limit-per-hour:5}") int limitPerHour) {
        this.limitPerHour = limitPerHour;
    }

    public boolean isAllowed(String clientKey) {
        if (clientKey == null || clientKey.isBlank()) {
            clientKey = "unknown";
        }

        Instant now = Instant.now();
        Window window = windows.compute(clientKey, (key, existing) -> {
            if (existing == null || now.isAfter(existing.resetAt)) {
                return new Window(1, now.plusSeconds(3600));
            }
            existing.count++;
            return existing;
        });

        return window.count <= limitPerHour;
    }

    private static class Window {
        int count;
        Instant resetAt;

        Window(int count, Instant resetAt) {
            this.count = count;
            this.resetAt = resetAt;
        }
    }
}
