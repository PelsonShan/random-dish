package com.randomdish.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class SpaceResponse {
    private Long id;
    private String name;
    private String inviteCode;
    private Long ownerId;
    private String ownerName;
    private int memberCount;
    private List<MemberInfo> members;
    private LocalDateTime createdAt;

    @Data @Builder
    public static class MemberInfo {
        private Long userId;
        private String username;
        private String nickname;
        private String role;
    }
}
