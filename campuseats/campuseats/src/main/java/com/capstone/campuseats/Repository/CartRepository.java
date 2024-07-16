package com.capstone.campuseats.Repository;

import com.capstone.campuseats.Entity.CartEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends MongoRepository<CartEntity, ObjectId> {
    Optional<CartEntity> findById(ObjectId uid);
}
