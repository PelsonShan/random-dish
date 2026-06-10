package com.randomdish.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Schema(description = "菜品标签")
@TableName("tags")
@NoArgsConstructor @AllArgsConstructor @Builder
public class Tag {
    @Schema(description = "标签ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @Schema(description = "标签名称，如：中式、微辣")
    private String name;

    @Schema(description = "标签分类，如：菜系、口味、类型")
    private String category;

    @Schema(description = "创建时间")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
