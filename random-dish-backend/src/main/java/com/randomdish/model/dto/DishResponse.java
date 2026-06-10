package com.randomdish.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
@Schema(description = "菜品响应")
public class DishResponse {
    @Schema(description = "菜品ID")
    private Long id;
    @Schema(description = "菜品名称")
    private String name;
    @Schema(description = "图片URL")
    private String imageUrl;
    @Schema(description = "适用餐段，逗号分隔")
    private String mealType;
    @Schema(description = "餐段中文描述")
    private String mealTypeLabel;
    @Schema(description = "创建者名称")
    private String creatorName;
    @Schema(description = "标签列表")
    private List<TagInfo> tags;
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    @Data @Builder
    @Schema(description = "标签信息")
    public static class TagInfo {
        @Schema(description = "标签ID")
        private Long id;
        @Schema(description = "标签名称")
        private String name;
        @Schema(description = "标签分类")
        private String category;
    }
}
