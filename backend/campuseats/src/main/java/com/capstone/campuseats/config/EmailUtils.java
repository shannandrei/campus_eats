package com.capstone.campuseats.config;

public class EmailUtils {

    public static String getEmailMessage(String name, String host, String token){
        return "Hello "+name+ ",\n\nPlease click the link below to verify your account. \n\n"
                + getVerificationUrl(host, token) + "\n\nCampus Eats Team";
    }

    private static String getVerificationUrl(String host, String token){
        return host+"/api/users/verify?token="+token;
    }
}
