package com.capstone.campuseats.Controller;

import com.capstone.campuseats.Entity.ShopEntity;
import com.capstone.campuseats.Entity.UserEntity;
import com.capstone.campuseats.Service.ShopService;
import com.capstone.campuseats.config.CustomException;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @GetMapping
    public ResponseEntity<List<ShopEntity>> getAllShops() {
        return new ResponseEntity<>(shopService.getAllShops(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<ShopEntity>> getShopById(@PathVariable ObjectId id) {
        return new ResponseEntity<>(shopService.getShopById(id), HttpStatus.OK);
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyShop(@RequestParam("shop") ShopEntity shop, @RequestParam("image") MultipartFile image) throws IOException {
        try {
            ShopEntity createdShop = shopService.createShop(shop, image);
            return new ResponseEntity<>(createdShop, HttpStatus.CREATED);
        } catch (CustomException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<ShopEntity>> getActiveShops() {
        return new ResponseEntity<>(shopService.getActiveShops(), HttpStatus.OK);
    }
}

//    @PutMapping("/update")
//    public ResponseEntity<?> updateShop(@RequestBody ShopEntity shop) {
//        try {
//            ShopEntity updatedShop = shopService.updateShop(shop);
//            return new ResponseEntity<>(updatedShop, HttpStatus.OK);
//        } catch (CustomException ex) {
//            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
//        }
//    }