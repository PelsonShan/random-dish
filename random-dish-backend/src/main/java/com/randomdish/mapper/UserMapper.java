package com.randomdish.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.randomdish.model.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
