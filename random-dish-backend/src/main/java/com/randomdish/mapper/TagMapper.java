package com.randomdish.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.randomdish.model.entity.Tag;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TagMapper extends BaseMapper<Tag> {
}
