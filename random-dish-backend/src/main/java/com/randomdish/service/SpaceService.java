package com.randomdish.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.randomdish.mapper.*;
import com.randomdish.model.dto.*;
import com.randomdish.model.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceMapper spaceMapper;
    private final SpaceMemberMapper memberMapper;
    private final UserMapper userMapper;
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public List<SpaceResponse> listMySpaces(Long userId) {
        List<SpaceMember> members = memberMapper.selectList(
                new LambdaQueryWrapper<SpaceMember>().eq(SpaceMember::getUserId, userId));
        return members.stream().map(m -> {
            Space space = spaceMapper.selectById(m.getSpaceId());
            return toSpaceResponse(space);
        }).collect(Collectors.toList());
    }

    @Transactional
    public SpaceResponse createSpace(Long userId, SpaceRequest req) {
        User owner = userMapper.selectById(userId);
        Space space = new Space();
        space.setName(req.getName());
        space.setInviteCode(generateCode());
        space.setOwnerId(userId);
        space.setCreatedAt(LocalDateTime.now());
        spaceMapper.insert(space);

        SpaceMember member = new SpaceMember();
        member.setSpaceId(space.getId());
        member.setUserId(userId);
        member.setRole(MemberRole.ADMIN);
        member.setJoinedAt(LocalDateTime.now());
        memberMapper.insert(member);

        space.setOwner(owner);
        return toSpaceResponse(space);
    }

    @Transactional
    public SpaceResponse joinSpace(Long userId, JoinSpaceRequest req) {
        Space space = spaceMapper.selectOne(
                new LambdaQueryWrapper<Space>().eq(Space::getInviteCode, req.getInviteCode().toUpperCase()));
        if (space == null) throw new RuntimeException("邀请码无效");

        if (memberMapper.selectCount(new LambdaQueryWrapper<SpaceMember>()
                .eq(SpaceMember::getSpaceId, space.getId())
                .eq(SpaceMember::getUserId, userId)) > 0) {
            throw new RuntimeException("你已经是该空间的成员");
        }

        SpaceMember member = new SpaceMember();
        member.setSpaceId(space.getId());
        member.setUserId(userId);
        member.setRole(MemberRole.MEMBER);
        member.setJoinedAt(LocalDateTime.now());
        memberMapper.insert(member);
        return toSpaceResponse(space);
    }

    public SpaceResponse getSpaceDetail(Long userId, Long spaceId) {
        Space space = spaceMapper.selectById(spaceId);
        if (space == null) throw new RuntimeException("空间不存在");
        checkMembership(userId, spaceId);
        return toSpaceResponse(space);
    }

    public Space getSpaceEntity(Long spaceId) {
        Space space = spaceMapper.selectById(spaceId);
        if (space == null) throw new RuntimeException("空间不存在");
        return space;
    }

    public void checkMembership(Long userId, Long spaceId) {
        if (memberMapper.selectCount(new LambdaQueryWrapper<SpaceMember>()
                .eq(SpaceMember::getSpaceId, spaceId)
                .eq(SpaceMember::getUserId, userId)) == 0) {
            throw new RuntimeException("无权访问该空间");
        }
    }

    public void checkAdmin(Long userId, Long spaceId) {
        SpaceMember member = memberMapper.selectOne(new LambdaQueryWrapper<SpaceMember>()
                .eq(SpaceMember::getSpaceId, spaceId)
                .eq(SpaceMember::getUserId, userId));
        if (member == null || member.getRole() != MemberRole.ADMIN) {
            throw new RuntimeException("仅管理员可执行此操作");
        }
    }

    private SpaceResponse toSpaceResponse(Space space) {
        List<SpaceMember> members = memberMapper.selectList(
                new LambdaQueryWrapper<SpaceMember>().eq(SpaceMember::getSpaceId, space.getId()));

        User owner = userMapper.selectById(space.getOwnerId());

        return SpaceResponse.builder()
                .id(space.getId())
                .name(space.getName())
                .inviteCode(space.getInviteCode())
                .ownerId(space.getOwnerId())
                .ownerName(owner != null ? owner.getUsername() : "未知")
                .memberCount(members.size())
                .members(members.stream().map(m -> {
                    User u = userMapper.selectById(m.getUserId());
                    return SpaceResponse.MemberInfo.builder()
                            .userId(m.getUserId())
                            .username(u != null ? u.getUsername() : "未知")
                            .nickname(u != null ? u.getNickname() : "")
                            .role(m.getRole().name())
                            .build();
                }).collect(Collectors.toList()))
                .createdAt(space.getCreatedAt())
                .build();
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++)
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        return sb.toString();
    }
}
