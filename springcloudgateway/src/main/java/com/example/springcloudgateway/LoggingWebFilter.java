package com.example.springcloudgateway;

import org.reactivestreams.Publisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.*;
import java.nio.charset.StandardCharsets;

@Component
public class LoggingWebFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(LoggingWebFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();

        // Log request body
        return DataBufferUtils.join(request.getBody())
                .flatMap(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    DataBufferUtils.release(dataBuffer);
                    String bodyString = new String(bytes, StandardCharsets.UTF_8);
                    logger.info("Incoming Request Body: {}", bodyString);

                    // recreate the flux for downstream
                    Flux<DataBuffer> cachedFlux = Flux.defer(() -> Flux.just(response.bufferFactory().wrap(bytes)));

                    ServerHttpRequest mutatedRequest = new ServerHttpRequestDecorator(request) {
                        @Override
                        public Flux<DataBuffer> getBody() {
                            return cachedFlux;
                        }
                    };

                    ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();

                    // Wrap response to capture body
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
                                String responseBody = baos.toString(StandardCharsets.UTF_8);
                                logger.info("Outgoing Response Body: {}", responseBody);
                            });
                        }
                    };

                    return chain.filter(mutatedExchange.mutate().response(decoratedResponse).build());
                });
    }
}
