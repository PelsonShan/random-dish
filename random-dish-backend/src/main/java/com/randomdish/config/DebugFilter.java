package com.randomdish.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(-10000)
public class DebugFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        System.out.println(">>> REQUEST: " + request.getMethod() + " " + request.getRequestURI()
                + " | X-User-Id=" + request.getHeader("X-User-Id")
                + " | Origin=" + request.getHeader("Origin"));
        chain.doFilter(req, res);
        System.out.println("<<< RESPONSE: " + request.getMethod() + " " + request.getRequestURI());
    }
}
