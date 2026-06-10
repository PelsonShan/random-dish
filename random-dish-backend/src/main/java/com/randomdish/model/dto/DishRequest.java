package com.randomdish.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;
import java.util.Set;

@Data
@Schema(description = "菜品请求")
public class DishRequest {
    @NotBlank @Size(min = 1, max = 100)
    @Schema(description = "菜品名称")
    private String name;

    @Schema(description = "图片URL")
    private String imageUrl;

    @Schema(description = "适用餐段列表: BREAKFAST,LUNCH,DINNER,ANY")
    private List<String> mealTypes;

    @Schema(description = "标签ID列表")
    private Set<Long> tagIds;
}
