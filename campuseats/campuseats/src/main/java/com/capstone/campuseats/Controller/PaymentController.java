package com.capstone.campuseats.Controller;

import com.capstone.campuseats.Entity.CartItem;
import com.capstone.campuseats.Service.OrderService;
import com.capstone.campuseats.Service.PaymentService;
import com.capstone.campuseats.config.CustomException;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// test this endpoint in postman then do the last undone na endpoint (about online payment)
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/confirm-order-completion")
    public ResponseEntity<?> confirmOrderCompletion(@RequestBody Map<String, Object> payload) {
        try {
            ObjectId orderId = new ObjectId((String) payload.get("orderId"));
            ObjectId dasherId = new ObjectId((String) payload.get("dasherId"));
            ObjectId shopId = new ObjectId((String) payload.get("shopId"));
            ObjectId userId = new ObjectId((String) payload.get("userId"));
            String paymentMethod = (String) payload.get("paymentMethod");
            float deliveryFee = Float.parseFloat(payload.get("deliveryFee").toString());
            float totalPrice = Float.parseFloat(payload.get("totalPrice").toString());
            List<Map<String, Object>> itemsPayload = (List<Map<String, Object>>) payload.get("items");

            List<CartItem> items = itemsPayload.stream().map(itemMap ->
                    CartItem.builder()
                            .id(new ObjectId((String) itemMap.get("id")))
                            .name((String) itemMap.get("name"))
                            .unitPrice(Float.parseFloat(itemMap.get("unitPrice").toString()))
                            .price(Float.parseFloat(itemMap.get("price").toString()))
                            .quantity(Integer.parseInt(itemMap.get("quantity").toString()))
                            .itemQuantity(Integer.parseInt(itemMap.get("itemQuantity").toString()))
                            .build()
            ).collect(Collectors.toList());

            paymentService.confirmOrderCompletion(orderId, dasherId, shopId, userId, paymentMethod, deliveryFee, totalPrice, items);

            return ResponseEntity.ok(Map.of("message", "Order completion confirmed successfully"));
        } catch (CustomException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error"));
        }
    }

    @PostMapping("/create-gcash-payment")
    public ResponseEntity<?> createGcashPayment(@RequestBody Map<String, Object> payload) {
        try {
            float amount = Float.parseFloat(payload.get("amount").toString());
            String description = payload.get("description").toString();
            ObjectId orderId = new ObjectId((String) payload.get("orderId"));

            return paymentService.createGcashPayment(amount, description, orderId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
