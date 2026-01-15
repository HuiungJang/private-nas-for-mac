package com.manas.backend.context.auth.application.port.out;

public interface CheckUserExistsPort {

    boolean existsByUsername(String username);

}
