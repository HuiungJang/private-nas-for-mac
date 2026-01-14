package com.manas.backend.context.file.domain;

public enum PreviewType {
    THUMBNAIL(200, 200),
    LARGE(1024, 1024);

    private final int width;
    private final int height;

    PreviewType(int width, int height) {
        this.width = width;
        this.height = height;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }
}
