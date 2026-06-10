package com.randomdish.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.randomdish.mapper.*;
import com.randomdish.model.dto.*;
import com.randomdish.model.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendService {

    private final DishMapper dishMapper;
    private final DishTagMapper dishTagMapper;
    private final TagMapper tagMapper;
    private final RecommendHistoryMapper historyMapper;
    private final UserMapper userMapper;
    private final Random random = new Random();
    private static final int RECENT_DAYS = 7;

    @Transactional
    public DishResponse recommend(Long userId, Long spaceId, RecommendRequest req) {
        // 晚餐有25%概率推荐"出去吃"
        if ("DINNER".equals(req.getMealType()) && random.nextInt(100) < 10) {
            return DishResponse.builder()
                .id(-1L).name("出去吃").mealType("DINNER").mealTypeLabel("晚餐")
                .creatorName("系统").tags(List.of()).build();
        }
        List<Dish> candidates = buildCandidateList(spaceId, req, null);
        if (candidates.isEmpty()) throw new RuntimeException("没有符合条件的菜品");
        Dish picked = pickOne(spaceId, candidates);
        saveHistory(userId, spaceId, picked, req.getMealType());
        return toResponse(picked);
    }

    @Transactional
    public MultiRecommendResponse recommendMultiple(Long userId, Long spaceId, RecommendRequest req) {
        String pattern = req.getPattern() != null ? req.getPattern() : "single";
        List<Dish> results = new ArrayList<>();
        Set<Long> usedIds = new HashSet<>();

        // 查汤品标签ID
        Long soupTagId = getTagIdByName("汤品");

        for (int round = 0; round < patternRounds(pattern); round++) {
            String excludeTag = null;
            if (soupTagId != null && shouldPickSoup(pattern, round)) {
                // 这轮要选汤 — 必须包含汤品标签
                List<Dish> soupCandidates = buildCandidateList(spaceId, req, soupTagId);
                soupCandidates = soupCandidates.stream().filter(d -> !usedIds.contains(d.getId())).toList();
                Dish picked = pickFromList(soupCandidates);
                if (picked != null) { results.add(picked); usedIds.add(picked.getId()); continue; }
            }
            // 普通菜
            List<Dish> candidates = buildCandidateList(spaceId, req, null);
            candidates = candidates.stream().filter(d -> !usedIds.contains(d.getId())).toList();
            Dish picked = pickFromList(candidates);
            if (picked != null) { results.add(picked); usedIds.add(picked.getId()); }
        }

        if (results.isEmpty()) throw new RuntimeException("没有符合条件的菜品");

        for (Dish d : results) saveHistory(userId, spaceId, d, req.getMealType());

        return MultiRecommendResponse.builder()
                .pattern(pattern)
                .dishes(results.stream().map(this::toResponse).collect(Collectors.toList()))
                .summary(patternLabel(pattern, results))
                .build();
    }

    public List<DishResponse> history(Long userId, Long spaceId) {
        return historyMapper.selectList(new LambdaQueryWrapper<RecommendHistory>()
                .eq(RecommendHistory::getSpaceId, spaceId)
                .eq(RecommendHistory::getUserId, userId)
                .orderByDesc(RecommendHistory::getCreatedAt))
                .stream().map(h -> { Dish d = dishMapper.selectById(h.getDishId()); return d != null ? toResponse(d) : null; })
                .filter(Objects::nonNull).collect(Collectors.toList());
    }

    private Dish pickOne(Long spaceId, List<Dish> candidates) {
        Set<Long> recent = new HashSet<>(historyMapper.findRecentDishIds(spaceId, LocalDateTime.now().minusDays(RECENT_DAYS)));
        List<Dish> available = candidates.stream().filter(d -> !recent.contains(d.getId())).toList();
        if (available.isEmpty()) available = candidates;
        return available.get(random.nextInt(available.size()));
    }

    private Dish pickFromList(List<Dish> list) {
        if (list.isEmpty()) return null;
        return list.get(random.nextInt(list.size()));
    }

    private List<Dish> buildCandidateList(Long spaceId, RecommendRequest req, Long requiredTagId) {
        LambdaQueryWrapper<Dish> qw = new LambdaQueryWrapper<Dish>().eq(Dish::getSpaceId, spaceId);
        if (req.getMealType() != null && !req.getMealType().isBlank())
            qw.like(Dish::getMealType, req.getMealType());
        if (req.getTagIds() != null && !req.getTagIds().isEmpty()) {
            return dishMapper.findBySpaceAndTags(spaceId, new ArrayList<>(req.getTagIds()));
        }
        return dishMapper.selectList(qw);
    }

    private void saveHistory(Long userId, Long spaceId, Dish dish, String mealType) {
        RecommendHistory h = new RecommendHistory();
        h.setUserId(userId); h.setDishId(dish.getId()); h.setSpaceId(spaceId);
        h.setMealType(mealType != null ? mealType : "ANY");
        h.setCreatedAt(LocalDateTime.now());
        historyMapper.insert(h);
    }

    private int patternRounds(String pattern) {
        return switch (pattern) {
            case "one_one" -> 2;  // 一菜 + 一汤
            case "two_one" -> 3; case "three_one" -> 4;
            default -> 1;
        };
    }

    private boolean shouldPickSoup(String pattern, int round) {
        return switch (pattern) {
            case "one_one" -> round == 1;
            case "two_one" -> round == 2; case "three_one" -> round == 3;
            default -> false;
        };
    }

    private Long getTagIdByName(String name) {
        Tag tag = tagMapper.selectOne(new LambdaQueryWrapper<Tag>()
                .eq(Tag::getName, name).eq(Tag::getCategory, "类型"));
        return tag != null ? tag.getId() : null;
    }

    private String patternLabel(String pattern, List<Dish> dishes) {
        int count = dishes.size();
        return switch (pattern) {
            case "one_one" -> "一菜一汤" + (count < 2 ? "(菜品不足)" : "");
            case "two_one" -> "两菜一汤" + (count < 3 ? "(菜品不足)" : "");
            case "three_one" -> "三菜一汤" + (count < 4 ? "(菜品不足)" : "");
            default -> dishes.stream().map(Dish::getName).collect(Collectors.joining("、"));
        };
    }

    private DishResponse toResponse(Dish dish) {
        List<Long> tagIds = dishTagMapper.selectTagIdsByDishId(dish.getId());
        List<Tag> tags = tagIds.isEmpty() ? List.of() : tagMapper.selectBatchIds(tagIds);
        User creator = userMapper.selectById(dish.getCreatorId());
        return DishResponse.builder()
                .id(dish.getId()).name(dish.getName()).imageUrl(dish.getImageUrl())
                .mealType(dish.getMealType()).mealTypeLabel(mealTypeLabel(dish.getMealType()))
                .creatorName(creator != null ? creator.getUsername() : "未知")
                .tags(tags.stream().map(t -> DishResponse.TagInfo.builder()
                        .id(t.getId()).name(t.getName()).category(t.getCategory()).build()).collect(Collectors.toList()))
                .createdAt(dish.getCreatedAt()).updatedAt(dish.getUpdatedAt()).build();
    }

    private String mealTypeLabel(String types) {
        if (types == null) return "不限";
        return Arrays.stream(types.split(","))
                .map(t -> switch (t) { case "BREAKFAST"->"早餐"; case "LUNCH"->"午餐"; case "DINNER"->"晚餐"; default->"不限"; })
                .collect(Collectors.joining("、"));
    }
}
