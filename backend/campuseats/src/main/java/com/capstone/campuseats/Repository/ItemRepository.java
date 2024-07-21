package com.capstone.campuseats.Repository;

import com.capstone.campuseats.Entity.ItemEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends MongoRepository<ItemEntity, ObjectId> {
    List<ItemEntity> findByNameAndShopId(String name, ObjectId shopId);
    List<ItemEntity> findByShopIdAndQuantityGreaterThan(ObjectId shopId, int quantity);
}
