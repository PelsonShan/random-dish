package com.randomdish.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SpaceRequest {
    @NotBlank @Size(min = 1, max = 100)
    private String name;
}
