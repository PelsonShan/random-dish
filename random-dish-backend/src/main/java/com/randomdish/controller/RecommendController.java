package com.randomdish.controller;

import com.randomdish.model.dto.*;
import com.randomdish.service.RecommendService;
import com.randomdish.service.SpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "推荐", description = "随机推荐引擎")
@RestController
@RequestMapping("/api/spaces/{spaceId}")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;
    private final SpaceService spaceService;

    @Operation(summary = "随机推荐", description = "按餐段、标签、菜品数量模式随机推荐")
    @PostMapping("/recommend")
    public ApiResponse<?> recommend(
            @Parameter(hidden = true) HttpServletRequest request,
            @PathVariable Long spaceId,
            @RequestBody(required = false) RecommendRequest req) {
        spaceService.checkMembership(getUserId(request), spaceId);
        if (req == null) req = new RecommendRequest();
        if (req.getPattern() != null && !req.getPattern().equals("single")) {
            return ApiResponse.ok(recommendService.recommendMultiple(getUserId(request), spaceId, req));
        }
        return ApiResponse.ok(recommendService.recommend(getUserId(request), spaceId, req));
    }

    @Operation(summary = "推荐历史", description = "最近推荐记录")
    @GetMapping("/history")
    public ApiResponse<List<DishResponse>> history(
            @Parameter(hidden = true) HttpServletRequest request,
            @PathVariable Long spaceId) {
        spaceService.checkMembership(getUserId(request), spaceId);
        return ApiResponse.ok(recommendService.history(getUserId(request), spaceId));
    }

    private Long getUserId(HttpServletRequest request) {
        String uid = request.getHeader("X-User-Id");
        return uid != null ? Long.valueOf(uid) : 1L;
    }
}
