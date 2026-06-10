package com.randomdish.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.randomdish.mapper.*;
import com.randomdish.model.dto.DishRequest;
import com.randomdish.model.dto.DishResponse;
import com.randomdish.model.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DishService {

    private final DishMapper dishMapper;
    private final DishTagMapper dishTagMapper;
    private final TagMapper tagMapper;
    private final UserMapper userMapper;

    public List<DishResponse> listDishes(Long spaceId, String mealType, Set<Long> tagIds) {
        List<Dish> dishes;
        if (mealType != null && !mealType.isBlank()) {
            if (tagIds != null && !tagIds.isEmpty()) {
                dishes = dishMapper.findBySpaceAndMealTypeAndTags(spaceId, mealType, new ArrayList<>(tagIds));
            } else {
                dishes = dishMapper.selectList(new LambdaQueryWrapper<Dish>()
                        .eq(Dish::getSpaceId, spaceId)
                        .like(Dish::getMealType, mealType));
            }
        } else if (tagIds != null && !tagIds.isEmpty()) {
            dishes = dishMapper.findBySpaceAndTags(spaceId, new ArrayList<>(tagIds));
        } else {
            dishes = dishMapper.selectList(new LambdaQueryWrapper<Dish>().eq(Dish::getSpaceId, spaceId));
        }
        return dishes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public DishResponse createDish(Long userId, Long spaceId, DishRequest req) {
        Dish dish = new Dish();
        dish.setSpaceId(spaceId);
        dish.setName(req.getName());
        dish.setImageUrl(req.getImageUrl());
        dish.setMealType(req.getMealTypes() != null && !req.getMealTypes().isEmpty()
                ? String.join(",", req.getMealTypes()) : "ANY");
        dish.setCreatorId(userId);
        dish.setCreatedAt(LocalDateTime.now());
        dish.setUpdatedAt(LocalDateTime.now());
        dishMapper.insert(dish);

        if (req.getTagIds() != null)
            for (Long tagId : req.getTagIds()) dishTagMapper.insert(dish.getId(), tagId);
        dish.setTags(loadTags(dish.getId()));
        return toResponse(dish);
    }

    @Transactional
    public DishResponse updateDish(Long userId, Long spaceId, Long dishId, DishRequest req) {
        Dish dish = dishMapper.selectById(dishId);
        if (dish == null || !dish.getSpaceId().equals(spaceId)) throw new RuntimeException("无权修改该菜品");

        com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Dish> uw =
            new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<>();
        uw.eq(Dish::getId, dishId)
          .set(Dish::getName, req.getName())
          .set(Dish::getUpdatedAt, LocalDateTime.now());

        if (req.getMealTypes() != null && !req.getMealTypes().isEmpty())
            uw.set(Dish::getMealType, String.join(",", req.getMealTypes()));

        // 允许将 imageUrl 设为 null（删除图片）
        uw.set(Dish::getImageUrl, req.getImageUrl());
        dishMapper.update(null, uw);

        if (req.getTagIds() != null) {
            dishTagMapper.deleteByDishId(dishId);
            for (Long tagId : req.getTagIds()) dishTagMapper.insert(dishId, tagId);
        }
        dish.setTags(loadTags(dishId));
        return toResponse(dish);
    }

    @Transactional
    public void deleteDish(Long spaceId, Long dishId) {
        Dish dish = dishMapper.selectById(dishId);
        if (dish == null || !dish.getSpaceId().equals(spaceId)) throw new RuntimeException("无权删除该菜品");
        dishTagMapper.deleteByDishId(dishId);
        dishMapper.deleteById(dishId);
    }

    private List<Tag> loadTags(Long dishId) {
        List<Long> tagIds = dishTagMapper.selectTagIdsByDishId(dishId);
        return tagIds.isEmpty() ? List.of() : tagMapper.selectBatchIds(tagIds);
    }

    private DishResponse toResponse(Dish dish) {
        List<Tag> tags = dish.getTags() != null ? dish.getTags() : loadTags(dish.getId());
        User creator = userMapper.selectById(dish.getCreatorId());
        return DishResponse.builder()
                .id(dish.getId()).name(dish.getName()).imageUrl(dish.getImageUrl())
                .mealType(dish.getMealType()).mealTypeLabel(mealTypeLabel(dish.getMealType()))
                .creatorName(creator != null ? creator.getUsername() : "未知")
                .tags(tags.stream().map(t -> DishResponse.TagInfo.builder()
                        .id(t.getId()).name(t.getName()).category(t.getCategory()).build())
                        .collect(Collectors.toList()))
                .createdAt(dish.getCreatedAt()).updatedAt(dish.getUpdatedAt())
                .build();
    }

    private String mealTypeLabel(String types) {
        if (types == null) return "不限";
        return Arrays.stream(types.split(","))
                .map(t -> switch (t) {
                    case "BREAKFAST" -> "早餐"; case "LUNCH" -> "午餐";
                    case "DINNER" -> "晚餐"; default -> "不限";
                }).collect(Collectors.joining("、"));
    }
}
