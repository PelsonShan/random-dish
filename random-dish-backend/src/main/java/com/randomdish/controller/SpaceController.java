package com.randomdish.controller;

import com.randomdish.model.dto.*;
import com.randomdish.service.SpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "空间", description = "共享空间管理")
@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    @Operation(summary = "我的空间列表")
    @GetMapping
    public ApiResponse<List<SpaceResponse>> list(
            @Parameter(hidden = true) HttpServletRequest request) {
        return ApiResponse.ok(spaceService.listMySpaces(getUserId(request)));
    }

    @Operation(summary = "创建空间")
    @PostMapping
    public ApiResponse<SpaceResponse> create(
            @Parameter(hidden = true) HttpServletRequest request,
            @Valid @RequestBody SpaceRequest req) {
        return ApiResponse.ok(spaceService.createSpace(getUserId(request), req));
    }

    @Operation(summary = "加入空间", description = "通过6位邀请码加入")
    @PostMapping("/join")
    public ApiResponse<SpaceResponse> join(
            @Parameter(hidden = true) HttpServletRequest request,
            @Valid @RequestBody JoinSpaceRequest req) {
        return ApiResponse.ok(spaceService.joinSpace(getUserId(request), req));
    }

    @Operation(summary = "空间详情", description = "含成员列表和邀请码")
    @GetMapping("/{id}")
    public ApiResponse<SpaceResponse> detail(
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(description = "空间ID") @PathVariable Long id) {
        return ApiResponse.ok(spaceService.getSpaceDetail(getUserId(request), id));
    }

    private Long getUserId(HttpServletRequest request) {
        String userId = request.getHeader("X-User-Id");
        return userId != null ? Long.valueOf(userId) : 1L;
    }
}
