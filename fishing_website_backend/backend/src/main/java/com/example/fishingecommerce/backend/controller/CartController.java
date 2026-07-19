package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CartItemRequest;
import com.example.fishingecommerce.backend.dto.response.CartItemResponse;
import com.example.fishingecommerce.backend.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Cart", description = "Quản lý giỏ hàng của khách hàng")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Lấy danh sách giỏ hàng", description = "Lấy các sản phẩm trong giỏ hàng của user đang đăng nhập")
    public ResponseEntity<List<CartItemResponse>> getCartItems(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(cartService.getCartItems(userId));
    }

    @PostMapping("/items")
    @Operation(summary = "Thêm vào giỏ hàng", description = "Thêm sản phẩm hoặc cập nhật số lượng trong giỏ hàng")
    public ResponseEntity<CartItemResponse> addItemToCart(
            Authentication authentication,
            @Valid @RequestBody CartItemRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(cartService.addItem(userId, request));
    }

    @PostMapping("/buy-now")
    @Operation(summary = "Mua ngay", description = "Cập nhật giỏ hàng để chuyển sang trang Checkout")
    public ResponseEntity<CartItemResponse> buyNow(
            Authentication authentication,
            @Valid @RequestBody CartItemRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(cartService.buyNow(userId, request));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Cập nhật số lượng mặt hàng", description = "Tăng hoặc giảm số lượng của một mặt hàng trong giỏ")
    public ResponseEntity<CartItemResponse> updateQuantity(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody com.example.fishingecommerce.backend.dto.request.CartItemQuantityRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(cartService.updateQuantity(userId, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Xóa mặt hàng khỏi giỏ", description = "Xóa một mặt hàng khỏi giỏ hàng")
    public ResponseEntity<Void> deleteItem(
            Authentication authentication,
            @PathVariable Long itemId) {
        Long userId = Long.valueOf(authentication.getName());
        cartService.deleteItem(userId, itemId);
        return ResponseEntity.noContent().build();
    }
}
