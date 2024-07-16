package com.capstone.campuseats.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Document(collection = "dashers")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DasherEntity {
    @Id
    private ObjectId id;
    private LocalTime availableTimeStart; // Available time start
    private LocalTime availableTimeEnd;
    private List<String> availableDays;
    private String status;
    private String schoolId;
    private String imageUrl;
    private String GcashName;
    private String GcashNumber;
    private LocalDateTime createdAt;
}
