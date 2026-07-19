package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.EmailRequest;
import com.example.fishingecommerce.backend.dto.request.OTPVerificationRequest;
import com.example.fishingecommerce.backend.dto.response.EmailResponse;
import com.example.fishingecommerce.backend.dto.response.OTPVerificationResponse;
import com.example.fishingecommerce.backend.entity.OTP;
import com.example.fishingecommerce.backend.entity.User;
import com.example.fishingecommerce.backend.enums.MailStatus;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.OTPRepository;
import com.example.fishingecommerce.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;

@Service
public class OTPService {

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Autowired
    UserRepository userRepository;

    private final int OTPLength = 6;
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    private JavaMailSender mailSender;

    private long currentWindow;

    @Autowired
    OTPRepository otpRepository;

    public EmailResponse sendOTP(EmailRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email khong duoc de trong");
        }

        User user = userRepository.findUserByEmail(request.getEmail()).orElseThrow(
                () -> new AppException(HttpStatus.BAD_REQUEST, "Email chua dang ky trong he thong")
        );

        String otp = generateOtp();
        currentWindow = Instant.now().getEpochSecond() / 180;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (senderEmail != null && !senderEmail.isBlank()) {
                message.setFrom(senderEmail);
            }
            message.setTo(user.getEmail());
            message.setSubject("Yeu cau doi mat khau");
            message.setText("Day la ma OTP cua ban, vui long khong chia se cho bat ky ai: " + otp);

            mailSender.send(message);
            saveOtp(user, otp);
        } catch (MailException e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the gui email OTP. Vui long thu lai sau.");
        }

        return EmailResponse.builder()
                .status(MailStatus.SUCCESS.toString())
                .expiryTime(currentWindow)
                .build();
    }

    private void saveOtp(User user, String otp) {
        OTP otpCode = new OTP();
        otpCode.setCode(otp);
        otpCode.setEmail(user.getEmail());
        otpCode.setTime(currentWindow);
        otpRepository.save(otpCode);
    }

    public OTPVerificationResponse verifyOtp(OTPVerificationRequest request) {
        OTP otp = otpRepository.findOTPByEmail(request.getEmail()).orElseThrow(
                () -> new AppException(HttpStatus.BAD_REQUEST, "Ma OTP khong ton tai")
        );
        currentWindow = Instant.now().getEpochSecond() / 180;
        boolean expired = (currentWindow - otp.getTime()) > 1;
        if (otp.getCode().equals(request.getOtp()) && !expired) {
            otpRepository.delete(otp);
            return OTPVerificationResponse.builder()
                    .status("Thanh Cong")
                    .build();
        } else {
            otpRepository.delete(otp);
        }
        return OTPVerificationResponse.builder()
                .status("Ma OTP da het han hoac khong dung")
                .build();
    }

    private String generateOtp() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTPLength; i++) {
            otp.append(secureRandom.nextInt(10));
        }
        return otp.toString();
    }
}
