package com.manas.backend.context.system.domain;

public record SystemSetting(String key, String value) {

    public static final String THEME_MODE_KEY = "theme.mode";
    public static final String THEME_PRIMARY_COLOR_KEY = "theme.primaryColor";

}
