package com.randomdish.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Data
@Schema(description = "菜品")
@TableName("dishes")
@NoArgsConstructor @AllArgsConstructor @Builder
public class Dish {
    @Schema(description = "菜品ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @Schema(description = "所属空间ID")
    private Long spaceId;

    @Schema(description = "菜品名称")
    private String name;

    @Schema(description = "菜品图片URL（支持长链接）")
    private String imageUrl;

    @Schema(description = "适用餐段，逗号分隔: BREAKFAST,LUNCH,DINNER,ANY")
    private String mealType;

    @Schema(description = "创建者用户ID")
    private Long creatorId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @Schema(description = "关联标签列表", accessMode = Schema.AccessMode.READ_ONLY)
    @TableField(exist = false)
    private List<Tag> tags;

    @Schema(description = "创建者信息", accessMode = Schema.AccessMode.READ_ONLY)
    @TableField(exist = false)
    private User creator;

    public List<String> getMealTypeList() {
        return mealType != null && !mealType.isBlank()
                ? Arrays.asList(mealType.split(",")) : Collections.singletonList("ANY");
    }
}
