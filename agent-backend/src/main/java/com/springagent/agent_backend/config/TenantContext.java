package com.springagent.agent_backend.config;

public class TenantContext {

    private static final String DEFAULT_TENANT = "pranav1921";
    private static final InheritableThreadLocal<String> CURRENT_TENANT = new InheritableThreadLocal<>();

    public static String getTenantId() {
        String tenant = CURRENT_TENANT.get();
        return (tenant != null && !tenant.isBlank()) ? tenant : DEFAULT_TENANT;
    }

    public static void setTenantId(String tenantId) {
        if (tenantId != null && !tenantId.isBlank()) {
            CURRENT_TENANT.set(tenantId.toLowerCase().replaceAll("[^a-zA-Z0-9_-]", ""));
        } else {
            CURRENT_TENANT.set(DEFAULT_TENANT);
        }
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
