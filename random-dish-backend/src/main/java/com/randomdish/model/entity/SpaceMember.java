package com.randomdish.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Schema(description = "空间成员")
@TableName("space_members")
@NoArgsConstructor @AllArgsConstructor @Builder
public class SpaceMember {
    @Schema(description = "成员关系ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @Schema(description = "空间ID")
    private Long spaceId;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "角色: ADMIN=管理员, MEMBER=普通成员")
    private MemberRole role;

    @Schema(description = "空间信息", accessMode = Schema.AccessMode.READ_ONLY)
    @TableField(exist = false)
    private Space space;

    @Schema(description = "用户信息", accessMode = Schema.AccessMode.READ_ONLY)
    @TableField(exist = false)
    private User user;

    @Schema(description = "加入时间")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime joinedAt;
}
