package com.example.fishingecommerce.backend.config;

import com.example.fishingecommerce.backend.entity.ReturnRequest;
import com.example.fishingecommerce.backend.enums.ReturnRequestStatus;
import com.example.fishingecommerce.backend.repository.ReturnRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class ReturnInitializer {

    @Bean
    public CommandLineRunner initReturns(ReturnRequestRepository returnRequestRepository) {
        return args -> {
            if (returnRequestRepository.count() == 0) {
                returnRequestRepository.save(ReturnRequest.builder()
                        .code("RET-101")
                        .orderId("1")
                        .customerName("Trần Minh Hoàng")
                        .productName("Máy câu Shimano Stella SW")
                        .variantId(1L)
                        .variantSku("WS-SHI-STELLA")
                        .quantity(1)
                        .reason("Hàng trầy xước nhẹ khi vận chuyển")
                        .refundAmount(BigDecimal.valueOf(18500000))
                        .bankName("Vietcombank")
                        .bankAccount("0071001234567")
                        .bankHolder("TRAN MINH HOANG")
                        .date(LocalDate.now())
                        .status(ReturnRequestStatus.PENDING_APPROVAL)
                        .build());

                returnRequestRepository.save(ReturnRequest.builder()
                        .code("RET-102")
                        .orderId("2")
                        .customerName("Phạm Thị Lan")
                        .productName("Lều Dã Ngoại Peak-4 Naturehike")
                        .variantId(2L)
                        .variantSku("WS-CAMP-PEAK4")
                        .quantity(1)
                        .reason("Sai màu sắc so với đơn đặt hàng")
                        .refundAmount(BigDecimal.valueOf(5800000))
                        .bankName("Techcombank")
                        .bankAccount("1903456789012")
                        .bankHolder("PHAM THI LAN")
                        .date(LocalDate.now())
                        .status(ReturnRequestStatus.APPROVED)
                        .build());

                returnRequestRepository.save(ReturnRequest.builder()
                        .code("RET-103")
                        .orderId("3")
                        .customerName("Lê Văn Nam")
                        .productName("Bộ Lưỡi Câu Titan Chống Gỉ")
                        .variantId(3L)
                        .variantSku("WS-HOOK-TITAN")
                        .quantity(2)
                        .reason("Kích cỡ lưỡi câu quá bé")
                        .refundAmount(BigDecimal.valueOf(360000))
                        .bankName("MB Bank")
                        .bankAccount("9704221234567")
                        .bankHolder("LE VAN NAM")
                        .date(LocalDate.now())
                        .status(ReturnRequestStatus.REFUNDED)
                        .build());

                returnRequestRepository.save(ReturnRequest.builder()
                        .code("RET-104")
                        .orderId("4")
                        .customerName("Nguyễn Văn A")
                        .productName("Cần câu Lure Daiwa Crossfire X")
                        .variantId(4L)
                        .variantSku("WS-DAI-CROSS")
                        .quantity(1)
                        .reason("Đơn giao hàng thất bại - Hàng trả lại kho kiểm định")
                        .date(LocalDate.now())
                        .status(ReturnRequestStatus.PENDING_INSPECTION)
                        .build());
            }
        };
    }
}
