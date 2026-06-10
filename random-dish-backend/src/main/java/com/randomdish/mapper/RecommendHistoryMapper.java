package com.randomdish.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.randomdish.model.entity.RecommendHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface RecommendHistoryMapper extends BaseMapper<RecommendHistory> {

    @Select("SELECT DISTINCT dish_id FROM recommend_history WHERE space_id = #{spaceId} AND created_at >= #{since}")
    List<Long> findRecentDishIds(@Param("spaceId") Long spaceId, @Param("since") LocalDateTime since);
}
