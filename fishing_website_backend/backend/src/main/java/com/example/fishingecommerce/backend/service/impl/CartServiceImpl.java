package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CartItemRequest;
import com.example.fishingecommerce.backend.dto.response.CartItemResponse;
import com.example.fishingecommerce.backend.entity.CartItem;
import com.example.fishingecommerce.backend.entity.ProductVariant;
import com.example.fishingecommerce.backend.entity.User;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.CartItemRepository;
import com.example.fishingecommerce.backend.repository.ProductVariantRepository;
import com.example.fishingecommerce.backend.repository.UserRepository;
import com.example.fishingecommerce.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Override
    public List<CartItemResponse> getCartItems(Long userId) {
        return cartItemRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CartItemResponse addItem(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Biến thể sản phẩm không tồn tại"));

        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số lượng trong kho không đủ");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndVariantId(userId, request.getVariantId());
        CartItem item;
        if (existingItem.isPresent()) {
            item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (variant.getStockQuantity() < newQuantity) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Số lượng trong kho không đủ để thêm vào giỏ hàng");
            }
            item.setQuantity(newQuantity);
        } else {
            item = CartItem.builder()
                    .user(user)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem saved = cartItemRepository.save(item);
        return mapToResponse(saved);
    }

    @Override
    public CartItemResponse updateQuantity(Long userId, Long itemId, com.example.fishingecommerce.backend.dto.request.CartItemQuantityRequest request) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm trong giỏ không tồn tại"));
        
        if (!item.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Không có quyền cập nhật giỏ hàng này");
        }

        ProductVariant variant = item.getVariant();
        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số lượng trong kho không đủ");
        }

        item.setQuantity(request.getQuantity());
        CartItem saved = cartItemRepository.save(item);
        return mapToResponse(saved);
    }

    @Override
    public void deleteItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm trong giỏ không tồn tại"));

        if (!item.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Không có quyền xóa sản phẩm này");
        }

        cartItemRepository.delete(item);
    }

    @Override
    public CartItemResponse buyNow(Long userId, CartItemRequest request) {
        // buyNow can be similar to addItem but we can decide to not accumulate quantity, just overwrite or return as is.
        // Actually, just add it to cart and return the item. Or we can just ensure it is in the cart with at least requested quantity.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Biến thể sản phẩm không tồn tại"));

        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số lượng trong kho không đủ");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndVariantId(userId, request.getVariantId());
        CartItem item;
        if (existingItem.isPresent()) {
            item = existingItem.get();
            // For buy now, usually we just update to the exact quantity the user wants to buy right now
            item.setQuantity(request.getQuantity());
        } else {
            item = CartItem.builder()
                    .user(user)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem saved = cartItemRepository.save(item);
        return mapToResponse(saved);
    }

    private CartItemResponse mapToResponse(CartItem item) {
        ProductVariant variant = item.getVariant();
        return CartItemResponse.builder()
                .id(item.getId())
                .variantId(variant.getId())
                .productName(variant.getProduct().getName())
                .variantName(variant.getVariantName())
                .sku(variant.getSku())
                .price(variant.getDiscountPrice() != null ? variant.getDiscountPrice() : variant.getBasePrice())
                .image(variant.getProduct().getImage())
                .quantity(item.getQuantity())
                .build();
    }
}
