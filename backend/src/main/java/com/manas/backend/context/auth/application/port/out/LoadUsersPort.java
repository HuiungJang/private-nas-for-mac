package com.manas.backend.context.auth.application.port.out;

import com.manas.backend.context.auth.domain.User;
import java.util.List;

public interface LoadUsersPort {

    List<User> findAll();

}
