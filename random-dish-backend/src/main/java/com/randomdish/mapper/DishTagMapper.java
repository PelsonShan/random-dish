package com.randomdish.mapper;

import org.apache.ibatis.annotations.*;

@Mapper
public interface DishTagMapper {

    @Insert("INSERT INTO dish_tags (dish_id, tag_id) VALUES (#{dishId}, #{tagId})")
    void insert(@Param("dishId") Long dishId, @Param("tagId") Long tagId);

    @Delete("DELETE FROM dish_tags WHERE dish_id = #{dishId}")
    void deleteByDishId(@Param("dishId") Long dishId);

    @Select("SELECT tag_id FROM dish_tags WHERE dish_id = #{dishId}")
    java.util.List<Long> selectTagIdsByDishId(@Param("dishId") Long dishId);
}
