package com.capstone.campuseats.Repository;

import com.capstone.campuseats.Entity.OrderEntity;
import com.capstone.campuseats.Entity.ShopEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<OrderEntity, ObjectId> {
    List<OrderEntity> findByUid(ObjectId uid);
    List<OrderEntity> findByDasherId(ObjectId dasherId);
    List<OrderEntity> findByStatusStartingWith(String status);
}
