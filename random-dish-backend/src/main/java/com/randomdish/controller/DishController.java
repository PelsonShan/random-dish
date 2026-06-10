package com.randomdish.controller;

import com.randomdish.model.dto.ApiResponse;
import com.randomdish.model.dto.DishRequest;
import com.randomdish.model.dto.DishResponse;
import com.randomdish.service.DishService;
import com.randomdish.service.SpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@Tag(name = "菜品", description = "菜品 CRUD")
@RestController
@RequestMapping("/api/spaces/{spaceId}/dishes")
@RequiredArgsConstructor
public class DishController {

    private final DishService dishService;
    private final SpaceService spaceService;

    @Operation(summary = "菜品列表", description = "支持按餐段和标签筛选")
    @GetMapping
    public ApiResponse<List<DishResponse>> list(
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(description = "空间ID") @PathVariable Long spaceId,
            @Parameter(description = "餐段: BREAKFAST/LUNCH/DINNER/ANY") @RequestParam(required = false) String mealType,
            @Parameter(description = "标签ID列表") @RequestParam(required = false) Set<Long> tagIds) {
        spaceService.checkMembership(getUserId(request), spaceId);
        return ApiResponse.ok(dishService.listDishes(spaceId, mealType, tagIds));
    }

    @Operation(summary = "添加菜品")
    @PostMapping
    public ApiResponse<DishResponse> create(
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(description = "空间ID") @PathVariable Long spaceId,
            @Valid @RequestBody DishRequest req) {
        spaceService.checkAdmin(getUserId(request), spaceId);
        return ApiResponse.ok(dishService.createDish(getUserId(request), spaceId, req));
    }

    @Operation(summary = "编辑菜品")
    @PutMapping("/{dishId}")
    public ApiResponse<DishResponse> update(
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(description = "空间ID") @PathVariable Long spaceId,
            @Parameter(description = "菜品ID") @PathVariable Long dishId,
            @Valid @RequestBody DishRequest req) {
        spaceService.checkAdmin(getUserId(request), spaceId);
        return ApiResponse.ok(dishService.updateDish(getUserId(request), spaceId, dishId, req));
    }

    @Operation(summary = "删除菜品")
    @DeleteMapping("/{dishId}")
    public ApiResponse<Void> delete(
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(description = "空间ID") @PathVariable Long spaceId,
            @Parameter(description = "菜品ID") @PathVariable Long dishId) {
        spaceService.checkAdmin(getUserId(request), spaceId);
        dishService.deleteDish(spaceId, dishId);
        return ApiResponse.ok(null);
    }

    private Long getUserId(HttpServletRequest request) {
        String userId = request.getHeader("X-User-Id");
        return userId != null ? Long.valueOf(userId) : 1L;
    }
}
