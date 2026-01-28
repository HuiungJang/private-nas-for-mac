package com.manas.backend.context.auth.infrastructure.persistence.mapper;

import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.User;
import com.manas.backend.context.auth.infrastructure.persistence.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "password", source = "passwordHash", qualifiedByName = "mapPassword")
    User toDomain(UserEntity entity);

    @Mapping(target = "passwordHash", source = "password.hash")
    @Mapping(target = "new", ignore = true)
    UserEntity toEntity(User domain);

    @Named("mapPassword")
    default Password mapPassword(String hash) {
        return Password.of(hash);
    }

}
