package com.traffic.simulation;

import java.time.LocalDateTime;

public class SimulationLog {
    private final String id;
    private final LocalDateTime timestamp;
    private final String threadName;
    private final String message;
    private final String level; // INFO, WARNING, SUCCESS, ALERT

    public SimulationLog(String threadName, String message, String level) {
        this.id = String.valueOf(System.nanoTime());
        this.timestamp = LocalDateTime.now();
        this.threadName = threadName;
        this.message = message;
        this.level = level != null ? level : "INFO";
    }

    public String getId() {
        return id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getThreadName() {
        return threadName;
    }

    public String getMessage() {
        return message;
    }

    public String getLevel() {
        return level;
    }
}
