package com.manas.backend.context.auth.application.port.out;

import java.util.List;

public interface IpConfigurationPort {

    List<String> getAllowedSubnets();

}
