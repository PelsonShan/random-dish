package com.randomdish.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Schema(description = "用户")
@TableName("users")
@NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Schema(description = "用户ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "密码哈希", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String passwordHash;

    @Schema(description = "昵称")
    private String nickname;

    @Schema(description = "创建时间")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
