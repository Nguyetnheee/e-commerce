package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CreateProductFullRequest;
import com.example.fishingecommerce.backend.dto.request.CreateProductRequest;
import com.example.fishingecommerce.backend.dto.request.CreateVariantRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateProductStatusRequest;
import com.example.fishingecommerce.backend.dto.response.ProductResponse;
import com.example.fishingecommerce.backend.dto.response.SearchResponse;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;
import com.example.fishingecommerce.backend.entity.Brand;
import com.example.fishingecommerce.backend.entity.Category;
import com.example.fishingecommerce.backend.entity.Product;
import com.example.fishingecommerce.backend.entity.Supplier;
import com.example.fishingecommerce.backend.entity.Tag;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.enums.ProductUsageType;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.BrandRepository;
import com.example.fishingecommerce.backend.repository.CategoryRepository;
import com.example.fishingecommerce.backend.repository.OrderRepository;
import com.example.fishingecommerce.backend.repository.ProductRepository;
import com.example.fishingecommerce.backend.repository.SupplierRepository;
import com.example.fishingecommerce.backend.repository.TagRepository;
import com.example.fishingecommerce.backend.service.ProductService;
import com.example.fishingecommerce.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SupplierRepository supplierRepository;
    private final TagRepository tagRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantService productVariantService;

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Product saved = saveProduct(request);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse createProductFull(CreateProductFullRequest request) {
        Product saved = saveProduct(request);
        productVariantService.createVariant(saved.getId(), toCreateVariantRequest(request.getInitialVariant()));

        Product refreshed = productRepository.findById(saved.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));
        return mapToResponse(refreshed);
    }

    @Override
    public ProductResponse updateStatus(Long productId, UpdateProductStatusRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));
        product.setIsVisible(request.getIsVisible());
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    public ProductResponse findById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));
        return mapToResponse(product);
    }

    @Override
    public ProductResponse findPublishedById(Long productId) {
        Product product = productRepository.findByIdAndIsVisibleTrue(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));
        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getPromotedProducts() {
        return productRepository.findPromotedProducts().stream()
                .map(ProductServiceImpl::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SearchResponse search(String keyword) {
        List<ProductResponse> productList = productRepository.findAllByNameContainingIgnoreCase(keyword).stream()
                .map(ProductServiceImpl::mapToResponse)
                .toList();
        return SearchResponse.builder()
                .productList(productList)
                .build();
    }

    @Override
    public SearchResponse searchPublished(String keyword) {
        List<ProductResponse> productList = productRepository.findAllByNameContainingIgnoreCaseAndIsVisibleTrue(keyword).stream()
                .map(ProductServiceImpl::mapToResponse)
                .toList();
        return SearchResponse.builder()
                .productList(productList)
                .build();
    }

    @Override
    public Page<ProductResponse> findPublishedProducts(
            Long categoryId,
            Long brandId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<String> materials,
            List<String> actions,
            String sortBy,
            Pageable pageable) {
        List<Product> products = productRepository.findPublishedProductsFiltered(
                categoryId,
                brandId,
                minPrice,
                maxPrice,
                normalizeFilterList(materials),
                normalizeFilterList(actions));

        List<Product> sortedProducts = sortProducts(products, sortBy);
        int total = sortedProducts.size();
        int start = Math.min((int) pageable.getOffset(), total);
        int end = Math.min(start + pageable.getPageSize(), total);
        List<ProductResponse> content = sortedProducts.subList(start, end).stream()
                .map(ProductServiceImpl::mapToResponse)
                .toList();
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    public List<VariantResponse> getVariantsByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));
        if (product.getVariants() == null) {
            return List.of();
        }
        return product.getVariants().stream().map(v -> VariantResponse.builder()
                .id(v.getId())
                .sku(v.getSku())
                .variantName(v.getVariantName())
                .basePrice(v.getBasePrice())
                .discountPrice(v.getDiscountPrice())
                .stockQuantity(v.getStockQuantity())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<VariantResponse> getPublishedVariantsByProductId(Long productId) {
        Product product = productRepository.findByIdAndIsVisibleTrue(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));
        if (product.getVariants() == null) {
            return List.of();
        }
        return product.getVariants().stream().map(v -> VariantResponse.builder()
                .id(v.getId())
                .sku(v.getSku())
                .variantName(v.getVariantName())
                .basePrice(v.getBasePrice())
                .discountPrice(v.getDiscountPrice())
                .stockQuantity(v.getStockQuantity())
                .build()).toList();
    }

    public static ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .image(product.getImage())
                .description(product.getDescription())
                .material(product.getMaterial())
                .action(product.getAction())
                .code(product.getCode())
                .time(product.getTime())
                .isVisible(product.getIsVisible())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                .usageType(product.getUsageType())
                .tags(product.getTags() != null
                        ? product.getTags().stream().map(Tag::getName).collect(Collectors.toSet())
                        : Set.of())
                .variants(product.getVariants() != null
                        ? product.getVariants().stream().map(v -> VariantResponse.builder()
                                .id(v.getId())
                                .sku(v.getSku())
                                .variantName(v.getVariantName())
                                .basePrice(v.getBasePrice())
                                .discountPrice(v.getDiscountPrice())
                                .stockQuantity(v.getStockQuantity())
                                .build()).collect(Collectors.toList())
                        : null)
                .build();
    }

    private Product saveProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Danh muc khong ton tai"));
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Thuong hieu khong ton tai"));
        Supplier supplier = resolveSupplier(request.getSupplierId());
        Set<Tag> tags = resolveTags(request.getTagIds());
        ProductUsageType usageType = request.getUsageType() != null
                ? request.getUsageType()
                : resolveUsageType(category);

        String normalizedCode = normalizeCode(request.getCode());
        if (normalizedCode != null && productRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new AppException(HttpStatus.CONFLICT, "Ma san pham da ton tai");
        }

        Product product = Product.builder()
                .code(normalizedCode)
                .time(request.getTime())
                .name(request.getName())
                .image(request.getImage())
                .description(request.getDescription())
                .material(request.getMaterial())
                .action(request.getAction())
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .category(category)
                .brand(brand)
                .supplier(supplier)
                .usageType(usageType)
                .tags(tags)
                .build();

        Product saved = productRepository.save(product);
        if (saved.getCode() == null || saved.getCode().isBlank()) {
            saved.setCode(generateProductCode(saved.getId()));
            saved = productRepository.save(saved);
        }
        return saved;
    }

    private Set<Tag> resolveTags(Set<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(tagRepository.findAllById(tagIds));
    }

    private Supplier resolveSupplier(Long supplierId) {
        if (supplierId == null) {
            return null;
        }
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Nha cung cap khong ton tai"));
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        return code.trim();
    }

    private String generateProductCode(Long productId) {
        return String.format("PROD-%06d", productId);
    }

    private ProductUsageType resolveUsageType(Category category) {
        Category current = category;
        while (current.getParent() != null) {
            current = current.getParent();
        }

        String normalized = normalizeText(current.getName());
        if (normalized.contains("camtrai")) {
            return ProductUsageType.CAM_TRAI;
        }
        if (normalized.contains("bien")) {
            return ProductUsageType.BIEN;
        }
        if (normalized.contains("song")) {
            return ProductUsageType.SONG;
        }
        if (normalized.contains("ho")) {
            return ProductUsageType.HO;
        }

        throw new AppException(HttpStatus.BAD_REQUEST, "Khong the suy ra usageType tu danh muc cha");
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private CreateVariantRequest toCreateVariantRequest(
            com.example.fishingecommerce.backend.dto.request.CreateProductInitialVariantRequest request) {
        CreateVariantRequest variantRequest = new CreateVariantRequest();
        variantRequest.setSku(request.getSku());
        variantRequest.setVariantName(request.getVariantName());
        variantRequest.setBasePrice(request.getBasePrice());
        variantRequest.setDiscountPrice(request.getDiscountPrice());
        variantRequest.setStockQuantity(request.getStockQuantity());
        return variantRequest;
    }

    private List<String> normalizeFilterList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        List<String> normalized = values.stream()
                .filter(v -> v != null && !v.isBlank())
                .map(String::trim)
                .collect(Collectors.toList());
        return normalized.isEmpty() ? null : normalized;
    }

    private List<Product> sortProducts(List<Product> products, String sortBy) {
        if (products == null || products.isEmpty()) {
            return List.of();
        }

        List<Product> sorted = new ArrayList<>(products);
        String sortKey = sortBy == null ? "newest" : sortBy.trim().toLowerCase();

        switch (sortKey) {
            case "priceasc" ->
                    sorted.sort(Comparator.comparing(this::resolveProductPrice, Comparator.nullsLast(Comparator.naturalOrder())));
            case "pricedesc" ->
                    sorted.sort(Comparator.comparing(this::resolveProductPrice, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
            case "bestseller" -> {
                Map<Long, Long> salesRank = buildBestSellerRank();
                sorted.sort(Comparator.comparing((Product p) -> salesRank.getOrDefault(p.getId(), 0L)).reversed());
            }
            case "newest" ->
                    sorted.sort(Comparator.comparing(Product::getId, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
            default -> {
                // Keep DB/default ordering when sortBy is unknown
            }
        }

        return sorted;
    }

    private BigDecimal resolveProductPrice(Product product) {
        if (product.getVariants() == null || product.getVariants().isEmpty()) {
            return null;
        }

        return product.getVariants().stream()
                .map(v -> v.getDiscountPrice() != null ? v.getDiscountPrice() : v.getBasePrice())
                .filter(java.util.Objects::nonNull)
                .min(Comparator.naturalOrder())
                .orElse(null);
    }

    private Map<Long, Long> buildBestSellerRank() {
        return orderRepository.findByStatus(OrderStatus.DELIVERED).stream()
                .flatMap(order -> order.getOrderItems() != null ? order.getOrderItems().stream() : java.util.stream.Stream.empty())
                .filter(item -> item.getProduct() != null)
                .collect(Collectors.groupingBy(item -> item.getProduct().getId(),
                        Collectors.summingLong(item -> item.getQuantity() != null ? item.getQuantity() : 0L)));
    }
}
