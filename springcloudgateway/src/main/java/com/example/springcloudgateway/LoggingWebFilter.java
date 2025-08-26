package com.example.springcloudgateway;

import org.reactivestreams.Publisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.*;
import java.net.URI;
import java.nio.charset.StandardCharsets;

@Component
public class LoggingWebFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(LoggingWebFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();

        // Log basic request information
        logger.info("=== INCOMING REQUEST ===");
        logger.info("Method: {} | Path: {} | Headers: {}",
                request.getMethod(),
                request.getPath().value(),
                request.getHeaders().toSingleValueMap());

        // Log request body
        return DataBufferUtils.join(request.getBody())
                .defaultIfEmpty(response.bufferFactory().allocateBuffer(0))
                .flatMap(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    if (bytes.length > 0) {
                        dataBuffer.read(bytes);
                        String bodyString = new String(bytes, StandardCharsets.UTF_8);
                        logger.info("Request Body: {}", bodyString);
                    } else {
                        logger.info("Request Body: [EMPTY]");
                    }
                    DataBufferUtils.release(dataBuffer);

                    // Recreate the flux for downstream
                    Flux<DataBuffer> cachedFlux = bytes.length > 0 ?
                            Flux.defer(() -> Flux.just(response.bufferFactory().wrap(bytes))) :
                            Flux.empty();

                    ServerHttpRequest mutatedRequest = new ServerHttpRequestDecorator(request) {
                        @Override
                        public Flux<DataBuffer> getBody() {
                            return cachedFlux;
                        }
                    };

                    ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();

                    // Wrap response to capture body and routing information
                    ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(response) {
                        private final ByteArrayOutputStream baos = new ByteArrayOutputStream();

                        @Override
                        public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                            Flux<? extends DataBuffer> fluxBody = Flux.from(body);
                            return super.writeWith(fluxBody.doOnNext(dataBuffer -> {
                                byte[] content = new byte[dataBuffer.readableByteCount()];
                                dataBuffer.read(content);
                                try {
                                    baos.write(content);
                                } catch (IOException e) {
                                    logger.error("Error writing response logging buffer", e);
                                }
                            })).doOnTerminate(() -> {
                                // Log routing information
                                logRoutingInformation(mutatedExchange);

                                // Log response information
                                String responseBody = baos.toString(StandardCharsets.UTF_8);
                                logger.info("=== OUTGOING RESPONSE ===");
                                logger.info("Status: {} | Headers: {}",
                                        response.getStatusCode(),
                                        response.getHeaders().toSingleValueMap());
                                logger.info("Response Body: {}", responseBody.isEmpty() ? "[EMPTY]" : responseBody);
                                logger.info("=== REQUEST COMPLETED ===\n");
                            });
                        }
                    };

                    return chain.filter(mutatedExchange.mutate().response(decoratedResponse).build())
                            .doOnSuccess(aVoid -> {
                                // This runs after routing decisions are made
                                logRoutingInformation(mutatedExchange);
                            });
                });
    }

    private void logRoutingInformation(ServerWebExchange exchange) {
        try {
            // Get the matched route
            Route route = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR);

            // Get the resolved request URL (where the request is being forwarded)
            URI requestUrl = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR);

            // Get the original request URL
            URI originalRequestUrl = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ORIGINAL_REQUEST_URL_ATTR);

            logger.info("=== ROUTING INFORMATION ===");
            logger.info("Original URL: {}", originalRequestUrl != null ? originalRequestUrl : "N/A");
            logger.info("Matched Route ID: {}", route != null ? route.getId() : "NO_ROUTE_MATCHED");
            logger.info("Route URI: {}", route != null ? route.getUri() : "N/A");
            logger.info("Forwarding to: {}", requestUrl != null ? requestUrl : "N/A");

            if (route != null) {

                logger.info("Route Filters: {}", route.getFilters());
                logger.info("Route Metadata: {}", route.getMetadata());
            }

        } catch (Exception e) {
            logger.warn("Error logging routing information: {}", e.getMessage());
        }
    }
}