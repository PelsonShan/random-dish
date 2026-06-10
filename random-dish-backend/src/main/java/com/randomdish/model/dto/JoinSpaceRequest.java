package com.randomdish.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JoinSpaceRequest {
    @NotBlank @Size(min = 6, max = 6)
    private String inviteCode;
}
