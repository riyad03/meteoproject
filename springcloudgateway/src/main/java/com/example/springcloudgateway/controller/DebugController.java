package com.example.springcloudgateway.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @Autowired
    private DiscoveryClient discoveryClient;

    @Autowired
    private LoadBalancerClient loadBalancerClient;

    @GetMapping("/services")
    public List<String> getServices() {
        return discoveryClient.getServices();
    }

    @GetMapping("/instances/{serviceId}")
    public List<ServiceInstance> getInstances(@PathVariable String serviceId) {
        return discoveryClient.getInstances(serviceId);
    }

    @GetMapping("/loadbalancer/{serviceId}")
    public ServiceInstance getLoadBalancerInstance(@PathVariable String serviceId) {
        return loadBalancerClient.choose(serviceId);
    }

    @GetMapping("/test-datamanager")
    public String testDatamanager() {
        try {
            List<ServiceInstance> instances = discoveryClient.getInstances("DATAMANAGER");
            if (instances.isEmpty()) {
                return "No instances found for DATAMANAGER";
            } else {
                return "Found " + instances.size() + " instances: " + instances.toString();
            }
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
