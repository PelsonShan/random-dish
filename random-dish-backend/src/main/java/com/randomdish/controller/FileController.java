package com.randomdish.controller;

import com.randomdish.model.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@Tag(name = "文件", description = "图片上传")
@RestController
@RequestMapping("/api")
public class FileController {

    @Value("${app.upload-dir:../random-dish-frontend/public/uploads}")
    private String uploadDir;

    @Operation(summary = "上传图片")
    @PostMapping("/upload")
    public ApiResponse<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        String ext = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf(".")) : ".png";
        String fileName = UUID.randomUUID() + ext;

        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        file.transferTo(new File(dir.toFile(), fileName));

        return ApiResponse.ok(Map.of("url", "/uploads/" + fileName, "fileName", fileName));
    }
}
