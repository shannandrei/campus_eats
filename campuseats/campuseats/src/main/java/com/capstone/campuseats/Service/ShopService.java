package com.capstone.campuseats.Service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.capstone.campuseats.Entity.DasherEntity;
import com.capstone.campuseats.Entity.ShopEntity;
import com.capstone.campuseats.Repository.ShopRepository;
import jakarta.annotation.PostConstruct;
import org.bson.BsonBinarySubType;
import org.bson.types.Binary;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class ShopService {
    private final ShopRepository shopRepository;

    @Value("${spring.cloud.azure.storage.blob.container-name}")
    private String containerName;


    @Value("${azure.blob-storage.connection-string}")
    private String connectionString;

    private BlobServiceClient blobServiceClient;

    @Autowired
    public ShopService(ShopRepository shopRepository) {
        this.shopRepository = shopRepository;
    }

    @PostConstruct
    public void init(){
        blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
    }

    public List<ShopEntity> getAllShops() {
        return shopRepository.findAll();
    }

    public Optional<ShopEntity> getShopById(ObjectId id) {
        return shopRepository.findById(id);
    }

    public ShopEntity createShop(ShopEntity shop, MultipartFile image) throws IOException {
        // Ensure createdAt is set
        if (shop.getCreatedAt() == null) {
            shop.setCreatedAt(LocalDateTime.now());
        }

        // Format the timestamp
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String formattedTimestamp = shop.getCreatedAt().format(formatter);
        System.out.println("timestamp: "+formattedTimestamp);
        // Sanitize shop name (optional)
        String sanitizedShopName = shop.getName().replaceAll("[^a-zA-Z0-9-_\\.]", "_");

        // Create the blob filename
        String blobFilename = formattedTimestamp + "_" + sanitizedShopName;

        BlobClient blobClient = blobServiceClient
                .getBlobContainerClient(containerName)
                .getBlobClient(blobFilename);

        blobClient.upload(image.getInputStream(), image.getSize(), true);

        String imageUrl = blobClient.getBlobUrl();

        shop.setImageUrl(imageUrl);
        return shopRepository.save(shop);
    }

    public List<ShopEntity> getActiveShops() {
        return shopRepository.findByStatus("active");
    }
}


//    public ShopEntity updateShop(ShopEntity shop) {
//        return shopRepository.save(shop);
//
//    }