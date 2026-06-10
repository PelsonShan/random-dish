package com.randomdish.controller;

import com.randomdish.model.dto.ApiResponse;
import com.randomdish.model.dto.TagResponse;
import com.randomdish.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "标签", description = "菜品标签查询（无需认证）")
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @Operation(summary = "获取全部标签", description = "返回所有预设标签，按分类分组")
    @GetMapping
    public ApiResponse<List<TagResponse>> list() {
        return ApiResponse.ok(tagService.listAll());
    }
}
