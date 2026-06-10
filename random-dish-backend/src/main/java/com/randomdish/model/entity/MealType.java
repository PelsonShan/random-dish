package com.randomdish.model.entity;

import com.baomidou.mybatisplus.annotation.EnumValue;

public enum MealType {
    BREAKFAST,
    LUNCH,
    DINNER,
    ANY;

    @EnumValue
    private final String value;

    MealType() {
        this.value = this.name();
    }
}
