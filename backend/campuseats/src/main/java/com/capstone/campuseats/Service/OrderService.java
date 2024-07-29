package com.capstone.campuseats.Service;

import com.capstone.campuseats.Entity.OrderEntity;
import com.capstone.campuseats.Repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;



    public OrderEntity placeOrder(OrderEntity order) {
        List<OrderEntity> existingOrders = orderRepository.findByUid(order.getUid());

        boolean activeOrderExists = existingOrders.stream()
                .anyMatch(existingOrder -> existingOrder.getStatus().startsWith("active"));

        if (activeOrderExists) {
            throw new RuntimeException("An active order already exists for this user");
        }

        order.setStatus("active_waiting_for_admin");
        order.setCreatedAt(LocalDateTime.now());
        String stringId = UUID.randomUUID().toString();
        order.setId(stringId);

        return orderRepository.save(order);
    }

    public void updateOrderStatus(String orderId, String status) {
        Optional<OrderEntity> orderOptional = orderRepository.findById(orderId);

        if (orderOptional.isEmpty()) {
            throw new RuntimeException("Order not found");
        }

        OrderEntity order = orderOptional.get();
        System.out.println("ordeer: "+ order);
        order.setStatus(status);
        order.setDasherId(order.getDasherId());
        orderRepository.save(order);
    }

    public ResponseEntity<Map<String, Object>> assignDasher(String orderId, String dasherId) {
        Optional<OrderEntity> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Order not found", "success", false));
        }

        OrderEntity order = orderOptional.get();
        if (order.getDasherId() != null && !order.getDasherId().equals(dasherId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Order is already assigned to another dasher", "success", false));
        }

        List<OrderEntity> dasherOrders = orderRepository.findByDasherId(dasherId);
        boolean ongoingOrderExists = dasherOrders.stream()
                .anyMatch(dasherOrder -> dasherOrder.getStatus().startsWith("active"));

        if (ongoingOrderExists) {
            return ResponseEntity.badRequest().body(Map.of("message", "Dasher has an ongoing order", "success", false));
        }

        order.setDasherId(dasherId);
        order.setStatus("active_toShop");
        orderRepository.save(order);

        return ResponseEntity.ok(Map.of("message", "Dasher assigned successfully", "success", true));
    }

    public List<OrderEntity> getOrdersByUserId(String uid) {
        return orderRepository.findByUid(uid);
    }

    public List<OrderEntity> getActiveOrders() {
        return orderRepository.findByStatusStartingWith("active_waiting_for_admin");
    }

    public List<OrderEntity> getOrdersByDasherId(String dasherId) {
        return orderRepository.findByDasherId(dasherId);
    }

    public List<OrderEntity> getOrdersWaitingForDasher() {
        return orderRepository.findByStatusStartingWith("active_waiting_for_dasher");
    }

    public List<OrderEntity> getActiveOrdersForDasher(String uid) {
        return orderRepository.findByDasherIdAndStatusStartingWith(new String(uid), "active");
    }

    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }

}