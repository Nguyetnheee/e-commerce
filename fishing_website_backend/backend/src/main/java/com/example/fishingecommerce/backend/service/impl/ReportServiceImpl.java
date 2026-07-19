package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.response.RevenueReportResponse;
import com.example.fishingecommerce.backend.dto.response.TopSellingResponse;
import com.example.fishingecommerce.backend.entity.Order;
import com.example.fishingecommerce.backend.entity.OrderItem;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.repository.OrderRepository;
import com.example.fishingecommerce.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;

    @Override
    public RevenueReportResponse getRevenueReport(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : LocalDateTime.MIN;
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        List<Order> orders = orderRepository.findByStatusAndCreatedAtBetween(OrderStatus.DELIVERED, from, to);

        BigDecimal totalRevenue = orders.stream()
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<LocalDate, List<Order>> grouped = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate()));

        List<RevenueReportResponse.DailyRevenue> daily = grouped.entrySet().stream()
                .map(e -> RevenueReportResponse.DailyRevenue.builder()
                        .date(e.getKey())
                        .revenue(e.getValue().stream()
                                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .orderCount((long) e.getValue().size())
                        .build())
                .sorted(Comparator.comparing(RevenueReportResponse.DailyRevenue::getDate))
                .collect(Collectors.toList());

        return RevenueReportResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .totalRevenue(totalRevenue)
                .dailyRevenues(daily)
                .build();
    }

    @Override
    public List<TopSellingResponse> getTopSelling(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : LocalDateTime.MIN;
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        List<Order> orders = orderRepository.findByStatusAndCreatedAtBetween(OrderStatus.DELIVERED, from, to);

        return orders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .filter(item -> item.getVariant() != null)
                .collect(Collectors.groupingBy(item -> item.getVariant().getId()))
                .values().stream()
                .map(items -> {
                    OrderItem first = items.get(0);
                    long qty = items.stream().mapToLong(OrderItem::getQuantity).sum();
                    BigDecimal revenue = items.stream()
                            .map(i -> i.getSoldPrice() != null && i.getQuantity() != null
                                    ? i.getSoldPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
                                    : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return TopSellingResponse.builder()
                            .productId(first.getProduct() != null ? first.getProduct().getId() : null)
                            .productName(first.getProduct() != null ? first.getProduct().getName() : null)
                            .variantId(first.getVariant().getId())
                            .variantName(first.getVariant().getVariantName())
                            .totalQuantity(qty)
                            .totalRevenue(revenue)
                            .build();
                })
                .sorted(Comparator.comparing(TopSellingResponse::getTotalQuantity).reversed())
                .collect(Collectors.toList());
    }
}
