package com.capstone.campuseats.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItem {
    private ObjectId id;
    private String name;
    private float unitPrice;
    private float price;
    private int quantity;
    private int itemQuantity;
}
