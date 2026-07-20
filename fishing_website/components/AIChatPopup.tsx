'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export default function AIChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Hide chat pop-up on admin, warehouse (kho), and shipper routes
  const isHidden =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/kho') ||
    pathname.startsWith('/shipper') ||
    pathname.startsWith('/admin-login');

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const now = new Date();
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: 'Chào mừng bạn đến với WildStream Gear! Tôi là trợ lý AI chuyên về dã ngoại và đồ câu. Bạn cần hỗ trợ thông tin gì hôm nay?',
          time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (isHidden) return null;

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: timeStr,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response with typing delay
    setTimeout(() => {
      let responseText = '';
      const cleanText = userText.toLowerCase().trim();

      if (cleanText.includes('cần câu') || cleanText.includes('máy câu') || cleanText.includes('đồ câu') || cleanText.includes('câu cá')) {
        responseText = 'Chào bạn! Cửa hàng chúng tôi hiện cung cấp nhiều dòng cần câu cao cấp:\n\n' +
          '🔹 **Câu cá biển (#sea)**: Các dòng cần chất liệu Titan/Carbon siêu chịu tải như Shimano Stella SW.\n' +
          '🔹 **Câu sông suối (#river)**: Cần carbon dẻo dai, trọng lượng siêu nhẹ và bền bỉ.\n' +
          '🔹 **Câu hồ (#lake)**: Bộ cần câu Lục chuyên dụng cho hồ tự nhiên hoặc hồ dịch vụ.\n\n' +
          'Bạn hãy truy cập mục danh mục tương ứng ở menu phía trên để chọn lựa sản phẩm phù hợp nhất nhé!';
      } else if (cleanText.includes('cắm trại') || cleanText.includes('lều') || cleanText.includes('dã ngoại') || cleanText.includes('du lịch')) {
        responseText = 'WildStream Gear tự hào sở hữu các dòng trang bị cắm trại hàng đầu:\n\n' +
          '⛺ Lều Peak-4 dã ngoại chống mưa bão tuyệt đối.\n' +
          '🪑 Ghế dã ngoại xếp gọn siêu nhẹ, tiện lợi di chuyển.\n' +
          '📦 Hòm nhựa đựng đồ 36L dã ngoại siêu bền.\n\n' +
          'Các sản phẩm đều từ các hãng nổi tiếng như WildStream, Naturehike. Bạn hãy nhấp vào danh mục **Cắm trại** trên website để khám phá ngay!';
      } else if (cleanText.includes('ship') || cleanText.includes('vận chuyển') || cleanText.includes('giao hàng') || cleanText.includes('phí')) {
        responseText = 'Chính sách vận chuyển của WildStream Gear:\n\n' +
          '✅ **Miễn phí vận chuyển** toàn quốc cho tất cả đơn hàng từ **3.000.000đ** trở lên.\n' +
          '💵 Đối với các đơn hàng dưới 3.000.000đ, phí ship tiêu chuẩn đồng giá là **50.000đ**.\n' +
          '⏱️ Thời gian nhận hàng thông thường từ 2 - 4 ngày làm việc tùy thuộc vào địa điểm của bạn.';
      } else if (cleanText.includes('đổi trả') || cleanText.includes('trả hàng') || cleanText.includes('hoàn tiền') || cleanText.includes('lỗi')) {
        responseText = 'Chính sách bảo hành và đổi trả linh hoạt của chúng tôi:\n\n' +
          '🤝 Hỗ trợ đổi trả trong vòng **7 ngày** kể từ ngày nhận hàng nếu sản phẩm có lỗi từ nhà sản xuất hoặc bị móp méo do vận chuyển.\n' +
          '📦 Sản phẩm đổi trả yêu cầu còn nguyên tem mác, hộp đựng và phụ kiện đi kèm.\n' +
          'Vui lòng truy cập trang cá nhân để yêu cầu đổi trả hoặc liên hệ CSKH để được trợ giúp trực tiếp.';
      } else if (cleanText.includes('địa chỉ') || cleanText.includes('cửa hàng') || cleanText.includes('showroom') || cleanText.includes('ở đâu')) {
        responseText = 'Hệ thống Showroom WildStream Gear:\n\n' +
          '📍 **Địa chỉ chính thức**: 123 Đường Sông Đà, Phường Biển Đông, TP. Đà Nẵng.\n' +
          '⏰ **Giờ mở cửa**: 08:00 - 22:00 tất cả các ngày trong tuần (bao gồm cả ngày nghỉ lễ).\n\n' +
          'Rất mong được đón tiếp quý khách đến trải nghiệm sản phẩm trực tiếp!';
      } else if (cleanText.includes('giá') || cleanText.includes('bao nhiêu') || cleanText.includes('khuyến mãi') || cleanText.includes('giảm giá')) {
        responseText = 'WildStream cung cấp sản phẩm đa dạng từ phân khúc phụ kiện câu cá vài chục nghìn đồng cho đến cần câu chuyên nghiệp cao cấp hàng chục triệu đồng.\n\n' +
          '🎁 Hiện tại chúng tôi đang áp dụng chương trình ưu đãi giảm giá lên đến 30% cho nhiều mặt hàng dã ngoại. Bạn có thể xem nhanh các sản phẩm giảm giá tại tab **Khuyến mãi** ở trang danh mục nhé!';
      } else if (cleanText.includes('chào') || cleanText.includes('hello') || cleanText.includes('hi') || cleanText.includes('chủ shop')) {
        responseText = 'Chào bạn! Rất vui được hỗ trợ bạn. Tôi là Trợ lý ảo WildStream AI, tôi có thể giúp gì cho hành trình dã ngoại của bạn hôm nay?';
      } else {
        responseText = 'Cảm ơn câu hỏi của bạn. Câu hỏi này nằm ngoài phạm vi hỗ trợ tự động của tôi.\n\n' +
          'Yêu cầu hỗ trợ của bạn đã được ghi nhận. Hệ thống đang chuyển tiếp thông tin tới nhân viên chăm sóc khách hàng trực tiếp, chúng tôi sẽ liên hệ hỗ trợ bạn qua SĐT/Email đăng ký trong vòng 5-10 phút. Bạn có cần tôi giúp thêm thông tin nào khác không?';
      }

      const newAiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newAiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-ambient hover:shadow-ambient-hover hover:scale-105 transition-all duration-300 group"
          aria-label="Mở chat hỗ trợ AI"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-accent-orange text-[9px] font-bold text-white items-center justify-center">
                1
              </span>
            </span>
          )}
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[400px] h-[500px] bg-surface-container-lowest rounded-2xl shadow-ambient border border-outline/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out">
          
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between border-b border-outline/10">
            <div className="flex items-center gap-3">
              <div className="relative bg-white/10 p-2 rounded-full">
                <Bot className="w-6 h-6 text-white" />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-primary"></span>
              </div>
              <div>
                <h3 className="text-body-md font-semibold leading-tight">WildStream AI Assistant</h3>
                <span className="text-[11px] text-white/70">Trợ lý hỗ trợ dã ngoại 24/7</span>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all duration-200"
              aria-label="Đóng chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-surface-container-low space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-2xl text-body-md whitespace-pre-line leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-on-surface rounded-bl-none border border-outline/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-on-surface-variant/60 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-outline/10 p-3 rounded-2xl rounded-bl-none flex items-center space-x-1.5 max-w-[85%]">
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-outline/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi về cần câu, lều trại, ship, đổi trả..."
              className="flex-1 bg-surface-container-low text-on-surface border border-outline/10 rounded-xl px-4 py-2.5 text-body-md focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-container disabled:opacity-40 disabled:hover:bg-primary transition-all duration-200 flex items-center justify-center"
              aria-label="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
