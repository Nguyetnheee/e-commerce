package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CartItemRequest;
import com.example.fishingecommerce.backend.dto.response.CartItemResponse;

import java.util.List;

public interface CartService {
    List<CartItemResponse> getCartItems(Long userId);
    CartItemResponse addItem(Long userId, CartItemRequest request);
    CartItemResponse updateQuantity(Long userId, Long itemId, com.example.fishingecommerce.backend.dto.request.CartItemQuantityRequest request);
    void deleteItem(Long userId, Long itemId);
    CartItemResponse buyNow(Long userId, CartItemRequest request);
}
