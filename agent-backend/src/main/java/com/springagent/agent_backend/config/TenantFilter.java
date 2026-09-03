package com.springagent.agent_backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        try {
            if (request instanceof HttpServletRequest httpRequest) {
                String tenant = httpRequest.getHeader("X-Tenant-Id");
                
                if (tenant == null || tenant.isBlank()) {
                    tenant = httpRequest.getParameter("tenant");
                }

                if (tenant == null || tenant.isBlank()) {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.getPrincipal() instanceof OAuth2User oauth2User) {
                        Object loginAttr = oauth2User.getAttribute("login");
                        if (loginAttr != null) {
                            tenant = loginAttr.toString();
                        }
                    }
                }

                TenantContext.setTenantId(tenant);
            }

            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
