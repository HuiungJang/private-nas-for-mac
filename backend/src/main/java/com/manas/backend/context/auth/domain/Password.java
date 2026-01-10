package com.manas.backend.context.auth.domain;

public record Password(String hash) {

    public static Password of(String hash) {
        return new Password(hash);
    }

}
