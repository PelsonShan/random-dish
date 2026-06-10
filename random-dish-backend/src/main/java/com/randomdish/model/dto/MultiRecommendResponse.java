package com.randomdish.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
@Schema(description = "多菜品推荐响应")
public class MultiRecommendResponse {
    @Schema(description = "推荐模式")
    private String pattern;
    @Schema(description = "推荐菜品列表")
    private List<DishResponse> dishes;
    @Schema(description = "推荐描述")
    private String summary;
}
