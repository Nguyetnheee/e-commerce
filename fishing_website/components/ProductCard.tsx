'use client';

import React, { useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';

interface ProductCardProps {
  id?: string | number;
  cardStyle?: 'minimal' | 'detailed' | 'lake';
  brand?: string;
  title: string;
  description?: string;
  price: string;
  imageUrl?: string;
  badge?: string;
  badgeType?: 'default' | 'premium' | 'accent'; // 'default' = green, 'premium' = blue, 'accent' = orange
  rating?: number;
  ratingCount?: number;
  onAddToCart?: (e?: React.MouseEvent) => void;
  onClick?: () => void;
}

export default function ProductCard({
  id,
  cardStyle = 'minimal',
  brand,
  title = 'Cần câu Carbon Pro-X',
  description,
  price = '2.450.000đ',
  imageUrl,
  badge,
  badgeType = 'default',
  rating = 5,
  ratingCount = 48,
  onAddToCart,
  onClick,
}: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      className={`group w-full bg-surface-container-lowest rounded-2xl shadow-ambient hover:shadow-ambient-hover border border-outline-variant/10 overflow-hidden transition-all duration-300 flex flex-col p-sm ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Product Image Section */}
      <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden rounded-xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-outline-variant">
            No Image
          </div>
        )}

        {/* Dynamic Badge styling */}
        {badge && (
          <div className={`absolute top-sm left-sm px-2.5 py-0.5 rounded-full font-sans text-[10px] font-semibold shadow-sm select-none ${
            badgeType === 'premium' 
              ? 'bg-[#1e40af] text-white'  // Blue "Premium" badge
              : badgeType === 'accent'
              ? 'bg-accent-orange text-white' // Orange "Mới về" badge
              : 'bg-[#a4f1b2] text-[#24703e]' // Green "Bán chạy" badge
          }`}>
            {badge}
          </div>
        )}

        {/* Circular Heart/Favorite Button for Detailed style */}
        {cardStyle === 'detailed' && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-sm right-sm w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-outline hover:text-red-500 hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Yêu thích"
          >
            <Heart 
              className={`w-4.5 h-4.5 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-outline-variant'
              }`} 
            />
          </button>
        )}
      </div>

      {/* Product Details Section */}
      <div className="pt-sm flex-grow flex flex-col justify-between text-left">
        <div>
          {/* Rating Stars (Detailed Style only) */}
          {cardStyle === 'detailed' && (
            <div className="flex items-center gap-0.5 mb-1 text-amber-500 font-sans">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < rating ? 'fill-current text-amber-500' : 'text-surface-dim'
                  }`}
                />
              ))}
              <span className="text-[10px] text-on-surface-variant font-medium ml-1">
                ({ratingCount})
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-body-md font-semibold text-on-surface font-sans line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>

          {/* Brand/Subtitle for Lake style */}
          {cardStyle === 'lake' && brand && (
            <span className="text-[11px] text-on-surface-variant font-sans mt-xs block leading-relaxed opacity-90">
              Thương hiệu: {brand}
            </span>
          )}

          {/* Description snippet for other styles */}
          {cardStyle !== 'lake' && description && (
            <p className="text-[11px] text-on-surface-variant font-sans mt-xs line-clamp-2 leading-relaxed opacity-95">
              {description}
            </p>
          )}
        </div>

        {/* Bottom Area: Conditional on CardStyle */}
        {cardStyle === 'detailed' ? (
          <div className="flex flex-col gap-sm mt-sm pt-xs border-t border-outline-variant/5">
            <span className="text-body-md font-bold text-primary font-sans">
              {price}
            </span>
            
            <button 
              type="button" 
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart?.(event);
              }}
              className="w-full bg-[#00288e] hover:bg-[#1e40af] text-white text-label-sm font-semibold rounded-md py-2.5 px-md flex items-center justify-center gap-xs shadow-sm hover:shadow transition-all duration-200 focus-visible:outline-none cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>THÊM VÀO GIỎ</span>
            </button>
          </div>
        ) : cardStyle === 'lake' ? (
          /* Lake Style Bottom layout: price on left, solid blue cart button on right */
          <div className="flex items-center justify-between mt-sm pt-xs border-t border-outline-variant/5">
            <span className="text-body-md font-bold text-primary font-sans">
              {price}
            </span>
            
            <button 
              type="button" 
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart?.(event);
              }}
              className="bg-[#00288e] hover:bg-[#1e40af] text-white rounded-md p-2 shadow-sm hover:shadow transition-all duration-200 focus-visible:outline-none flex items-center justify-center cursor-pointer"
              aria-label="Thêm vào giỏ"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          /* Minimal Style Bottom layout: price on left, cart button outline on right */
          <div className="flex items-center justify-between mt-sm pt-xs border-t border-outline-variant/5">
            <span className="text-body-md font-bold text-primary font-sans">
              {price}
            </span>
            
            <button 
              type="button" 
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart?.(event);
              }}
              className="border border-outline-variant/60 hover:border-primary hover:bg-primary/5 text-on-surface hover:text-primary rounded-md p-2 transition-all duration-200 focus-visible:outline-none cursor-pointer"
              aria-label="Thêm vào giỏ"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
