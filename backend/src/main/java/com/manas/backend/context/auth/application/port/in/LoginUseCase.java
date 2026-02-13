package com.manas.backend.context.auth.application.port.in;

public interface LoginUseCase {

    LoginResult login(String username, String password);

    void changePassword(String username, String currentPassword, String newPassword);

}
