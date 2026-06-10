package com.randomdish.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Schema(description = "推荐历史")
@TableName("recommend_history")
@NoArgsConstructor @AllArgsConstructor @Builder
public class RecommendHistory {
    @Schema(description = "记录ID")
    @TableId(type = IdType.AUTO)
    private Long id;
    @Schema(description = "用户ID")
    private Long userId;
    @Schema(description = "菜品ID")
    private Long dishId;
    @Schema(description = "空间ID")
    private Long spaceId;
    @Schema(description = "推荐时的餐段")
    private String mealType;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @Schema(description = "菜品信息", accessMode = Schema.AccessMode.READ_ONLY)
    @TableField(exist = false)
    private Dish dish;
}
