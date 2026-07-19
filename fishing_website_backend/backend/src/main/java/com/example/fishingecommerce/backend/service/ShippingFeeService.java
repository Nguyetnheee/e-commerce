package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.ShippingFeeRequest;
import com.example.fishingecommerce.backend.dto.response.ShippingFeeResponse;
import com.example.fishingecommerce.backend.entity.ProductVariant;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.ProductVariantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Locale;

@Service
public class ShippingFeeService {

    private final ProductVariantRepository productVariantRepository;

    public ShippingFeeService(ProductVariantRepository productVariantRepository) {
        this.productVariantRepository = productVariantRepository;
    }

    public ShippingFeeResponse calculateShippingFee(ShippingFeeRequest request) {
        int totalQuantity = request.getItems().stream()
                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (var item : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));
            BigDecimal price = variant.getDiscountPrice() != null ? variant.getDiscountPrice() : variant.getBasePrice();
            subtotal = subtotal.add(price.multiply(BigDecimal.valueOf(item.getQuantity() == null ? 0 : item.getQuantity())));
        }

        BigDecimal shippingFee = determineBaseFee(request.getProvince(), request.getDistrict());
        if (subtotal.compareTo(BigDecimal.valueOf(3_000_000)) >= 0) {
            shippingFee = BigDecimal.ZERO;
        } else if (totalQuantity > 5) {
            shippingFee = shippingFee.add(BigDecimal.valueOf((long) (totalQuantity - 5) * 5000L));
        }

        BigDecimal estimatedWeightKg = BigDecimal.valueOf(totalQuantity).multiply(BigDecimal.valueOf(0.5));

        return ShippingFeeResponse.builder()
                .shippingFee(shippingFee)
                .estimatedWeightKg(estimatedWeightKg)
                .build();
    }

    private BigDecimal determineBaseFee(String province, String district) {
        String normalizedProvince = province == null ? "" : province.toLowerCase(Locale.ROOT);
        String normalizedDistrict = district == null ? "" : district.toLowerCase(Locale.ROOT);

        if (normalizedProvince.contains("hà nội") || normalizedProvince.contains("ha noi")
                || normalizedProvince.contains("hồ chí minh") || normalizedProvince.contains("ho chi minh")
                || normalizedProvince.contains("tp. hcm") || normalizedProvince.contains("đà nẵng")
                || normalizedProvince.contains("da nang")) {
            return BigDecimal.valueOf(25000);
        }

        if (normalizedProvince.contains("hải phòng") || normalizedProvince.contains("hai phong")
                || normalizedProvince.contains("cần thơ") || normalizedProvince.contains("can tho")) {
            return BigDecimal.valueOf(30000);
        }

        if (normalizedDistrict.contains("huyện") || normalizedDistrict.contains("huyen")) {
            return BigDecimal.valueOf(40000);
        }

        return BigDecimal.valueOf(35000);
    }
}
