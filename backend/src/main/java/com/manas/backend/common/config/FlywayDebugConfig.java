package com.manas.backend.common.config;

import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayDebugConfig {

    @Bean
    public Flyway flyway(DataSource dataSource) {
        System.out.println(">>> DEBUG: Manually creating Flyway bean...");
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();
        flyway.migrate();
        System.out.println(">>> DEBUG: Flyway migration triggered manually in Bean factory.");
        return flyway;
    }

    /*
    @Bean
    public CommandLineRunner flywayRunner(Flyway flyway) {
        return args -> {
            System.out.println(">>> DEBUG: Flyway Bean Found! Triggering migrate manually...");
            flyway.migrate();
            System.out.println(">>> DEBUG: Flyway migrate completed.");
        };
    }
    */
}
