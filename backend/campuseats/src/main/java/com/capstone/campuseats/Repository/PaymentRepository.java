package com.capstone.campuseats.Repository;

import com.capstone.campuseats.Entity.PaymentEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends MongoRepository<PaymentEntity, ObjectId> {

}
