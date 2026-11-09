package com.traffic.controller;

import com.traffic.dto.ApiResponse;
import com.traffic.model.Intersection;
import com.traffic.repository.IntersectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/intersections")
@CrossOrigin
public class IntersectionController {

    private final IntersectionRepository intersectionRepository;

    public IntersectionController(IntersectionRepository intersectionRepository) {
        this.intersectionRepository = intersectionRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Intersection>>> getAllIntersections() {
        List<Intersection> list = intersectionRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Intersections retrieved", list));
    }
}
