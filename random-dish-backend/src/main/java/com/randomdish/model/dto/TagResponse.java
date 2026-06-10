package com.randomdish.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class TagResponse {
    private Long id;
    private String name;
    private String category;
    private LocalDateTime createdAt;
}
