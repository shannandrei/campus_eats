package com.capstone.campuseats.Entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "payments")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Setter
@Getter
public class PaymentEntity {
    @Id
    private ObjectId id;
    private ObjectId orderId;
    private ObjectId dasherId;
    private ObjectId shopId;
    private ObjectId userId;
    private String paymentMethod;
    private float deliveryFee;
    private float totalPrice;
    private List<CartItem> items;
    private LocalDateTime completedAt;
}
