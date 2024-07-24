package com.capstone.campuseats.Entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Setter
@Getter
public class UserEntity {
    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private boolean isVerified;
    private String accountType;
    private Date dateCreated;
    private String firstname;
    private String lastname;
    private String phone;
    private String dob;
    private String courseYear;

}
