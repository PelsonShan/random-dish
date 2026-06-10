package com.randomdish.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.randomdish.model.entity.Dish;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DishMapper extends BaseMapper<Dish> {

    @Select("""
        <script>
        SELECT DISTINCT d.* FROM dishes d
        JOIN dish_tags dt ON d.id = dt.dish_id
        WHERE d.space_id = #{spaceId}
        AND dt.tag_id IN
        <foreach item='id' collection='tagIds' open='(' separator=',' close=')'>
            #{id}
        </foreach>
        </script>
    """)
    List<Dish> findBySpaceAndTags(@Param("spaceId") Long spaceId, @Param("tagIds") List<Long> tagIds);

    @Select("""
        <script>
        SELECT DISTINCT d.* FROM dishes d
        JOIN dish_tags dt ON d.id = dt.dish_id
        WHERE d.space_id = #{spaceId}
        AND d.meal_type LIKE CONCAT('%',#{mealType},'%')
        AND dt.tag_id IN
        <foreach item='id' collection='tagIds' open='(' separator=',' close=')'>
            #{id}
        </foreach>
        </script>
    """)
    List<Dish> findBySpaceAndMealTypeAndTags(@Param("spaceId") Long spaceId,
                                               @Param("mealType") String mealType,
                                               @Param("tagIds") List<Long> tagIds);
}
