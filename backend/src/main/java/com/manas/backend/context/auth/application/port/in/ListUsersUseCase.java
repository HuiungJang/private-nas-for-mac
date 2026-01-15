package com.manas.backend.context.auth.application.port.in;

import com.manas.backend.context.auth.domain.User;
import java.util.List;

public interface ListUsersUseCase {

    List<User> listAllUsers();

}
