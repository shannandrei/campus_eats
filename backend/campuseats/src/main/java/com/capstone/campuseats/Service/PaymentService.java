package com.capstone.campuseats.Service;

import com.capstone.campuseats.Entity.CartItem;
import com.capstone.campuseats.Entity.ItemEntity;
import com.capstone.campuseats.Entity.OrderEntity;
import com.capstone.campuseats.Entity.PaymentEntity;
import com.capstone.campuseats.Repository.ItemRepository;
import com.capstone.campuseats.Repository.OrderRepository;
import com.capstone.campuseats.Repository.PaymentRepository;
import com.capstone.campuseats.config.CustomException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final PaymentRepository paymentRepository;

    @Value("${PAYMONGO_SECRET}")
    private String paymongoSecret;

    public void confirmOrderCompletion(String orderId, String dasherId, String shopId, String userId, String paymentMethod, float deliveryFee, float totalPrice, List<CartItem> items) {
        Optional<OrderEntity> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isEmpty()) {
            throw new CustomException("Order not found");
        }

        OrderEntity order = orderOptional.get();
        order.setStatus("completed");
        order.setDeliveryFee(deliveryFee);
        orderRepository.save(order);

        for (CartItem item : items) {
            Optional<ItemEntity> itemOptional = itemRepository.findById(item.getId());
            if (itemOptional.isPresent()) {
                ItemEntity itemEntity = itemOptional.get();
                int newQuantity = itemEntity.getQuantity() - item.getQuantity();
                itemEntity.setQuantity(newQuantity);
                itemRepository.save(itemEntity);
            }
        }

        PaymentEntity payment = PaymentEntity.builder()
                .orderId(orderId)
                .dasherId(dasherId)
                .shopId(shopId)
                .userId(userId)
                .paymentMethod(paymentMethod)
                .completedAt(LocalDateTime.now())
                .deliveryFee(deliveryFee)
                .totalPrice(totalPrice)
                .build();
        String stringId = UUID.randomUUID().toString();
        payment.setId(stringId);
        paymentRepository.save(payment);
    }


    public ResponseEntity<?> createGcashPayment(float amount, String description, String orderId) {
        try {
            // Check for active orders
            List<OrderEntity> existingOrders = orderRepository.findByUid(orderId);
            boolean activeOrderExists = existingOrders.stream()
                    .anyMatch(order -> order.getStatus().startsWith("active"));

            if (activeOrderExists) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "An active order already exists for this user"));
            }

            // Prepare PayMongo API request
            ObjectMapper objectMapper = new ObjectMapper();
            ObjectNode rootNode = objectMapper.createObjectNode();
            ObjectNode dataNode = rootNode.putObject("data");
            ObjectNode attributesNode = dataNode.putObject("attributes");

            attributesNode.put("amount", (int) (amount * 100));
            attributesNode.put("currency", "PHP");
            attributesNode.put("description", description);
            attributesNode.put("type", "gcash");

            ObjectNode redirectNode = attributesNode.putObject("redirect");
            redirectNode.put("success", "http://localhost:3000/success");
            redirectNode.put("failed", "http://localhost:3000/failed");

            String auth = Base64.getEncoder().encodeToString((paymongoSecret + ":").getBytes());

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.paymongo.com/v1/links"))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(rootNode)))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode responseBody = objectMapper.readTree(response.body());
            String checkoutUrl = responseBody.at("/data/attributes/checkout_url").asText();
            String id = responseBody.at("/data/id").asText();
            System.out.println("checkoutURL: " +checkoutUrl);
            if (response.statusCode() != 200) {
                String errorDetail = responseBody.at("/errors/0/detail").asText();
                throw new RuntimeException(errorDetail);
            }

            return ResponseEntity.ok(Map.of("checkout_url", checkoutUrl, "id", id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}
