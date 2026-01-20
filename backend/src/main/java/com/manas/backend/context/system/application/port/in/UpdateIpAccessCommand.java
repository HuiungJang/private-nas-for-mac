package com.manas.backend.context.system.application.port.in;

import java.util.List;

public record UpdateIpAccessCommand(List<String> allowedSubnets, String currentUserIp) {

}
