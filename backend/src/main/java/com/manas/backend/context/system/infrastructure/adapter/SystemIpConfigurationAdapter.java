package com.manas.backend.context.system.infrastructure.adapter;

import com.manas.backend.context.auth.application.port.out.IpConfigurationPort;
import com.manas.backend.context.system.infrastructure.persistence.repository.JpaSystemSettingRepository;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SystemIpConfigurationAdapter implements IpConfigurationPort {

    public static final String IP_ALLOWED_SUBNETS_KEY = "security.ip.allowed-subnets";
    private final JpaSystemSettingRepository repository;
    @Value("${security.vpn.allowed-subnets}")
    private String defaultAllowedSubnets;

    @Override
    public List<String> getAllowedSubnets() {
        String storedValue = repository.findById(IP_ALLOWED_SUBNETS_KEY)
                .map(entity -> entity.getValue())
                .orElse(defaultAllowedSubnets);

        if (storedValue == null || storedValue.isBlank()) {
            return List.of();
        }

        return Arrays.stream(storedValue.split(","))
                .map(String::trim)
                .toList();
    }

}
