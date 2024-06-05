package com.capstone.campuseats.Service;

import com.capstone.campuseats.Entity.ConfirmationEntity;
import com.capstone.campuseats.Entity.UserEntity;
import com.capstone.campuseats.Repository.ConfirmationRepository;
import com.capstone.campuseats.Repository.UserRepository;
import com.capstone.campuseats.config.CustomSignupException;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Date;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ConfirmationRepository confirmationRepository;
    @Autowired
    private EmailService emailService;

    public List<UserEntity> allUsers(){
        return userRepository.findAll();
    }

    public Optional<UserEntity> findUserById(ObjectId id){
        return userRepository.findById(id);
    }

    public Boolean verifyToken(String token) {
        ConfirmationEntity confirmation = confirmationRepository.findByToken(token);
        if (confirmation == null) {
            return Boolean.FALSE; // Token not found
        }

        Optional<UserEntity> optionalUser = userRepository.findByEmailIgnoreCase(confirmation.getUser().getEmail());
        if (optionalUser.isPresent()) {
            UserEntity user = optionalUser.get();
            user.setVerified(true);
            userRepository.save(user);
            return Boolean.TRUE;
        } else {
            return Boolean.FALSE;
        }
    }

    public UserEntity signup(UserEntity user) throws CustomSignupException {

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new CustomSignupException("The username is already in use by another account.");
        }

        if (userRepository.findByEmailIgnoreCase(user.getEmail()).isPresent()) {
            throw new CustomSignupException("The email address is already in use by another account.");
        }

        String encodedPassword = passwordEncoder.encode(user.getPassword());

        user.setPassword(encodedPassword);
        user.setAccountType("regular");
        user.setDateCreated(new Date());
        user.setVerified(false);
        user.setPhone(null);

        UserEntity savedUser = userRepository.save(user);

        ConfirmationEntity confirmation = new ConfirmationEntity(user);
        confirmation.setId(savedUser.getId());
        confirmationRepository.save(confirmation);

//        TODO send email to user with token
        emailService.sendEmail(user.getUsername(), user.getEmail(), confirmation.getToken());
        return savedUser;
    }
}
