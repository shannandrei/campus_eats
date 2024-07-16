package com.capstone.campuseats.Controller;

import com.capstone.campuseats.Entity.CartItem;
import com.capstone.campuseats.Entity.OrderEntity;
import com.capstone.campuseats.Service.OrderService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;


    @GetMapping("/active-lists")
    public ResponseEntity<?> getAllActiveOrders() {
        try {
            List<OrderEntity> activeOrders = orderService.getActiveOrders();

            if (activeOrders.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No orders found"));
            }

            return ResponseEntity.ok(activeOrders);
        } catch (Exception e) {
            System.err.println("Error fetching orders: " + e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal Server Error"));
        }
    }


    @PostMapping("/place-order")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> payload) {
        try {
            ObjectId uid = new ObjectId((String) payload.get("uid"));

            OrderEntity order = OrderEntity.builder()
                    .uid(uid)
                    .status("active_waiting_for_admin")
                    .createdAt(LocalDateTime.now())
                    .dasherId(null) // Handle dasherId
                    .shopId(new ObjectId((String) payload.get("shopId")))
                    .changeFor(Float.parseFloat(payload.get("changeFor").toString()))
                    .deliverTo((String) payload.get("deliverTo"))
                    .firstName((String) payload.get("firstName"))
                    .lastName((String) payload.get("lastName"))
                    .items((List<CartItem>) payload.get("items"))
                    .mobileNum((String) payload.get("mobileNum"))
                    .note((String) payload.get("note"))
                    .paymentMethod((String) payload.get("paymentMethod"))
                    .totalPrice(Float.parseFloat(payload.get("totalPrice").toString()))
                    .build();

            OrderEntity placedOrder = orderService.placeOrder(order);

            return new ResponseEntity<>(Map.of("message", "Order placed successfully", "id", placedOrder.getId().toString()), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/update-order-status")
    public ResponseEntity<?> updateOrderStatus(@RequestBody Map<String, Object> payload) {
        try {
            String orderIdStr = (String) payload.get("orderId");
            String status = (String) payload.get("status");

            if (orderIdStr == null || orderIdStr.isEmpty() || status == null || status.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Order ID and status are required"), HttpStatus.BAD_REQUEST);
            }

            ObjectId orderId = new ObjectId(orderIdStr);
            orderService.updateOrderStatus(orderId, status);

            return new ResponseEntity<>(Map.of("message", "Order status updated successfully"), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/assign-dasher")
    public ResponseEntity<?> assignDasher(@RequestBody Map<String, Object> payload) {
        try {
            String orderIdStr = (String) payload.get("orderId");
            String dasherIdStr = (String) payload.get("dasherId");

            if (orderIdStr == null || orderIdStr.isEmpty() || dasherIdStr == null || dasherIdStr.isEmpty()) {
                return ResponseEntity.badRequest().body("Order ID and Dasher ID are required");
            }

            ObjectId orderId = new ObjectId(orderIdStr);
            ObjectId dasherId = new ObjectId(dasherIdStr);

            ResponseEntity<?> response = orderService.assignDasher(orderId, dasherId);
            return response;

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/user/{uid}")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable String uid) {
        try {
            List<OrderEntity> orders = orderService.getOrdersByUserId(new ObjectId(uid));

            if (orders.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No orders found for this user"));
            }

            List<OrderEntity> activeOrders = orders.stream()
                    .filter(order -> order.getStatus().startsWith("active"))
                    .collect(Collectors.toList());

            List<OrderEntity> nonActiveOrders = orders.stream()
                    .filter(order -> !order.getStatus().startsWith("active"))
                    .collect(Collectors.toList());

            Map<String, Object> response = Map.of(
                    "orders", nonActiveOrders,
                    "activeOrders", activeOrders
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching orders: " + e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal Server Error"));
        }
    }
}
