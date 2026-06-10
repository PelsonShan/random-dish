package com.randomdish.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.util.Set;

@Data
@Schema(description = "推荐请求")
public class RecommendRequest {
    @Schema(description = "餐段筛选: BREAKFAST/LUNCH/DINNER")
    private String mealType;

    @Schema(description = "标签ID列表")
    private Set<Long> tagIds;

    @Schema(description = "推荐模式: single(单菜) / one_one(一菜一汤) / two_one(两菜一汤)")
    private String pattern;
}
