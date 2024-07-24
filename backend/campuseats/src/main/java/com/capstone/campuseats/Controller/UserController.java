package com.capstone.campuseats.Controller;

import com.capstone.campuseats.Entity.UserEntity;
import com.capstone.campuseats.Service.UserService;
import com.capstone.campuseats.config.CustomException;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return new ResponseEntity<List<UserEntity>>(userService.getAllUsers(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<UserEntity>> getUserById(@PathVariable String id) {
        return new ResponseEntity<Optional<UserEntity>>(userService.findUserById(id), HttpStatus.OK);
    }

    @GetMapping("/{id}/accountType")
    public ResponseEntity<?> getUserAccountType(@PathVariable String id) {
        try {
            String accountType = userService.getUserAccountType(id);
            return new ResponseEntity<>(accountType, HttpStatus.OK);
        } catch (CustomException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserEntity user) {
        try {
            UserEntity createdUser = userService.signup(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (CustomException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestParam("token") String token) {
        Boolean verified = userService.verifyToken(token);
        if (verified) {
            return ResponseEntity.ok("Your email has been successfully verified! You can now close this tab and log in to your account.");
        } else {
            // Handle verification failure
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Verification failed");
        }
    }


    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, Object>> authenticateUser(@RequestBody Map<String, String> credentials) {
        String usernameOrEmail = credentials.get("usernameOrEmail");
        String password = credentials.get("password");

        try {
            UserEntity user = userService.login(usernameOrEmail, password);
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (CustomException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserEntity user) {
        try {
            System.out.println("id:"+ id);
            userService.updateUser(id, user);
            return new ResponseEntity<>("User updated successfully", HttpStatus.OK);
        } catch (CustomException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/update/{userId}/accountType")
    public ResponseEntity<Boolean> updateAccountType(@PathVariable String userId, @RequestParam String accountType) {
        boolean isUpdated = userService.updateAccountType(userId, accountType);
        if (isUpdated) {
            return new ResponseEntity<>(true, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{userId}/updatePassword")
    public ResponseEntity<?> updatePassword(@PathVariable String userId, @RequestBody Map<String, String> passwords) {
        String oldPassword = passwords.get("oldPassword");
        String newPassword = passwords.get("newPassword");

        try {
            userService.updatePassword(userId, oldPassword, newPassword);
            return new ResponseEntity<>("Password updated successfully", HttpStatus.OK);
        } catch (CustomException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
