package com.randomdish.model.entity;

import com.baomidou.mybatisplus.annotation.EnumValue;

public enum MemberRole {
    ADMIN,
    MEMBER;

    @EnumValue
    private final String value;

    MemberRole() {
        this.value = this.name();
    }
}
