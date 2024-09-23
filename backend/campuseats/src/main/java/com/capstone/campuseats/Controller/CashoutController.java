package com.capstone.campuseats.Controller;

import com.capstone.campuseats.Entity.CashoutEntity;
import com.capstone.campuseats.Service.CashoutService;
import com.capstone.campuseats.config.CustomException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cashouts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CashoutController {

    private final CashoutService cashoutService;

    @GetMapping
    public ResponseEntity<List<CashoutEntity>> getAllCashouts() {
        return new ResponseEntity<>(cashoutService.getAllCashouts(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<CashoutEntity>> getCashoutById(@PathVariable String id) {
        return new ResponseEntity<>(cashoutService.getCashoutById(id), HttpStatus.OK);
    }

    @GetMapping("/pending-lists")
    public ResponseEntity<Map<String, List<CashoutEntity>>> getCashouts() {
        Map<String, List<CashoutEntity>> cashoutsMap = cashoutService.getCashouts();
        return new ResponseEntity<>(cashoutsMap, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCashout(
            @RequestPart("cashout") String cashoutStr,
            @RequestPart("image") MultipartFile image,
            @RequestPart("userId") String userId) throws IOException {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            CashoutEntity cashout = mapper.readValue(cashoutStr, CashoutEntity.class);
            System.out.println("Parsed CashoutEntity: " + cashout);
            CashoutEntity createdCashout = cashoutService.createCashout(cashout, image, userId);
            return new ResponseEntity<>(createdCashout, HttpStatus.CREATED);
        } catch (CustomException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/update/{cashoutId}/status")
    public ResponseEntity<Boolean> updateCashoutStatus(@PathVariable String cashoutId, @RequestParam String status) {
        boolean isUpdated = cashoutService.updateCashoutStatus(cashoutId, status);
        if (isUpdated) {
            return new ResponseEntity<>(true, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/update/{cashoutId}/reference")
    public ResponseEntity<CashoutEntity> updateCashoutReference(
            @PathVariable String cashoutId,
            @RequestParam String referenceNumber) {
        CashoutEntity updatedCashout = cashoutService.updateCashoutReference(cashoutId, referenceNumber);
        if (updatedCashout != null) {
            return new ResponseEntity<>(updatedCashout, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}