package com.capstone.campuseats.Controller;

import com.capstone.campuseats.Entity.UserEntity;
import com.capstone.campuseats.Service.UserService;
import com.capstone.campuseats.config.CustomSignupException;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return new ResponseEntity<List<UserEntity>>(userService.allUsers(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<UserEntity>> getUserById(@PathVariable ObjectId id) {
        return new ResponseEntity<Optional<UserEntity>>(userService.findUserById(id), HttpStatus.OK);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserEntity user) {
        try {
            UserEntity createdUser = userService.signup(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (CustomSignupException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestParam("token") String token) {
        Boolean verified = userService.verifyToken(token);
        return new ResponseEntity<>(verified, HttpStatus.OK);
    }
}
