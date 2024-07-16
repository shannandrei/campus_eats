package com.capstone.campuseats.Entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Setter
@Getter
public class OrderEntity {
    @Id
    private ObjectId id;
    private ObjectId uid;
    private String status;
    private LocalDateTime createdAt;
    private ObjectId dasherId;
    private ObjectId shopId;
    private float changeFor;
    private String deliverTo;
    private String firstName;
    private String lastName;
    private List<CartItem> items;
    private String mobileNum;
    private String note;
    private String paymentMethod;
    private float totalPrice;

}
