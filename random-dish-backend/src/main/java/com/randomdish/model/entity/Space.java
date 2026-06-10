package com.randomdish.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Schema(description = "共享空间")
@TableName("spaces")
@NoArgsConstructor @AllArgsConstructor @Builder
public class Space {
    @Schema(description = "空间ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @Schema(description = "空间名称")
    private String name;

    @Schema(description = "6位邀请码")
    private String inviteCode;

    @Schema(description = "创建者用户ID")
    private Long ownerId;

    @Schema(description = "创建者信息", accessMode = Schema.AccessMode.READ_ONLY)
    @TableField(exist = false)
    private User owner;

    @Schema(description = "创建时间")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
