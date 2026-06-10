package com.randomdish.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.randomdish.mapper.TagMapper;
import com.randomdish.mapper.UserMapper;
import com.randomdish.model.entity.Tag;
import com.randomdish.model.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final TagMapper tagMapper;
    private final UserMapper userMapper;

    @Override
    public void run(String... args) {
        if (userMapper.selectCount(null) == 0) {
            User user = new User();
            user.setUsername("default");
            user.setNickname("默认用户");
            user.setPasswordHash("");
            user.setCreatedAt(LocalDateTime.now());
            userMapper.insert(user);
        }

        if (tagMapper.selectCount(null) > 0) return;

        String[][] preset = {
            {"菜系","中式"},{"菜系","西式"},{"菜系","日料"},{"菜系","韩式"},{"菜系","东南亚"},
            {"类型","荤菜"},{"类型","素菜"},{"类型","半荤半素"},{"类型","汤品"},{"类型","小吃"},
            {"口味","清淡"},{"口味","微辣"},{"口味","麻辣"},{"口味","酸甜"},{"口味","咸香"},
        };
        for (String[] t : preset) {
            Tag tag = new Tag();
            tag.setCategory(t[0]);
            tag.setName(t[1]);
            tag.setCreatedAt(LocalDateTime.now());
            tagMapper.insert(tag);
        }
    }
}
