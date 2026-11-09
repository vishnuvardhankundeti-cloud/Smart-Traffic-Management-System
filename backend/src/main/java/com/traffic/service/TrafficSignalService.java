package com.traffic.service;

import com.traffic.dto.TrafficSignalDto;
import com.traffic.exception.ResourceNotFoundException;
import com.traffic.model.Intersection;
import com.traffic.model.SignalState;
import com.traffic.model.TrafficSignal;
import com.traffic.repository.IntersectionRepository;
import com.traffic.repository.TrafficSignalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrafficSignalService {

    private final TrafficSignalRepository trafficSignalRepository;
    private final IntersectionRepository intersectionRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public TrafficSignalService(TrafficSignalRepository trafficSignalRepository,
                                IntersectionRepository intersectionRepository) {
        this.trafficSignalRepository = trafficSignalRepository;
        this.intersectionRepository = intersectionRepository;
    }

    public List<TrafficSignalDto> getAllSignals() {
        return trafficSignalRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TrafficSignalDto getSignalById(Long id) {
        TrafficSignal signal = trafficSignalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Traffic signal ID " + id + " not found"));
        return toDto(signal);
    }

    @Transactional
    public TrafficSignalDto createSignal(TrafficSignalDto dto) {
        Intersection intersection = intersectionRepository.findById(dto.getIntersectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Intersection ID " + dto.getIntersectionId() + " not found"));

        TrafficSignal signal = new TrafficSignal();
        signal.setIntersection(intersection);
        signal.setIntersectionName(dto.getIntersectionName() != null ? dto.getIntersectionName() : intersection.getIntersectionName());
        signal.setConnectedRoads(dto.getConnectedRoads());
        signal.setCurrentSignalState(dto.getCurrentSignalState() != null ? dto.getCurrentSignalState() : SignalState.RED);
        signal.setGreenDurationSeconds(dto.getGreenDurationSeconds() != null ? dto.getGreenDurationSeconds() : 45);
        signal.setYellowDurationSeconds(dto.getYellowDurationSeconds() != null ? dto.getYellowDurationSeconds() : 5);
        signal.setRedDurationSeconds(dto.getRedDurationSeconds() != null ? dto.getRedDurationSeconds() : 50);
        signal.setCycleRemainingSeconds(signal.getGreenDurationSeconds());
        signal.setOperationalStatus(dto.getOperationalStatus() != null ? dto.getOperationalStatus() : "OPERATIONAL");
        signal.setMode(dto.getMode() != null ? dto.getMode() : "AUTOMATIC");
        signal.setLastStateChange(LocalDateTime.now());

        TrafficSignal saved = trafficSignalRepository.save(signal);
        return toDto(saved);
    }

    @Transactional
    public TrafficSignalDto updateSignal(Long id, TrafficSignalDto dto) {
        TrafficSignal signal = trafficSignalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Traffic signal ID " + id + " not found"));

        if (dto.getGreenDurationSeconds() != null) signal.setGreenDurationSeconds(dto.getGreenDurationSeconds());
        if (dto.getYellowDurationSeconds() != null) signal.setYellowDurationSeconds(dto.getYellowDurationSeconds());
        if (dto.getRedDurationSeconds() != null) signal.setRedDurationSeconds(dto.getRedDurationSeconds());
        if (dto.getCurrentSignalState() != null) {
            signal.setCurrentSignalState(dto.getCurrentSignalState());
            signal.setLastStateChange(LocalDateTime.now());
        }
        if (dto.getOperationalStatus() != null) signal.setOperationalStatus(dto.getOperationalStatus());
        if (dto.getMode() != null) signal.setMode(dto.getMode());
        if (dto.getConnectedRoads() != null) signal.setConnectedRoads(dto.getConnectedRoads());

        TrafficSignal updated = trafficSignalRepository.save(signal);
        return toDto(updated);
    }

    @Transactional
    public TrafficSignalDto cycleSignalManually(Long id) {
        TrafficSignal signal = trafficSignalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Traffic signal ID " + id + " not found"));

        SignalState nextState = switch (signal.getCurrentSignalState()) {
            case GREEN -> SignalState.YELLOW;
            case YELLOW -> SignalState.RED;
            case RED -> SignalState.GREEN;
        };

        signal.setCurrentSignalState(nextState);
        signal.setCycleRemainingSeconds(
                nextState == SignalState.GREEN ? signal.getGreenDurationSeconds() :
                nextState == SignalState.YELLOW ? signal.getYellowDurationSeconds() : signal.getRedDurationSeconds()
        );
        signal.setLastStateChange(LocalDateTime.now());
        return toDto(trafficSignalRepository.save(signal));
    }

    @Transactional
    public void emergencyPreempt(Long intersectionId) {
        trafficSignalRepository.findByIntersectionId(intersectionId).ifPresent(signal -> {
            signal.setCurrentSignalState(SignalState.GREEN);
            signal.setMode("EMERGENCY_PREEMPT");
            signal.setCycleRemainingSeconds(60);
            signal.setLastStateChange(LocalDateTime.now());
            trafficSignalRepository.save(signal);
        });
    }

    public TrafficSignalDto toDto(TrafficSignal s) {
        TrafficSignalDto dto = new TrafficSignalDto();
        dto.setId(s.getId());
        if (s.getIntersection() != null) {
            dto.setIntersectionId(s.getIntersection().getId());
            dto.setIntersectionName(s.getIntersection().getIntersectionName());
        } else {
            dto.setIntersectionName(s.getIntersectionName());
        }
        dto.setConnectedRoads(s.getConnectedRoads());
        dto.setCurrentSignalState(s.getCurrentSignalState());
        dto.setGreenDurationSeconds(s.getGreenDurationSeconds());
        dto.setYellowDurationSeconds(s.getYellowDurationSeconds());
        dto.setRedDurationSeconds(s.getRedDurationSeconds());
        dto.setCycleRemainingSeconds(s.getCycleRemainingSeconds());
        dto.setOperationalStatus(s.getOperationalStatus());
        dto.setMode(s.getMode());
        dto.setLastStateChange(s.getLastStateChange() != null ? s.getLastStateChange().format(FORMATTER) : null);
        return dto;
    }
}
