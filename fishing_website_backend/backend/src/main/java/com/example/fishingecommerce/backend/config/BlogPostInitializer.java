package com.example.fishingecommerce.backend.config;

import com.example.fishingecommerce.backend.entity.Post;
import com.example.fishingecommerce.backend.repository.PostRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class BlogPostInitializer {

    @Bean
    public CommandLineRunner initBlogPosts(PostRepository postRepository) {
        return args -> {
            if (postRepository.count() == 0) {
                Post post1 = Post.builder()
                        .title("Bí quyết chọn cần Lure và kỹ thuật chèo suối săn cá lăng, cá sộp")
                        .slug("bi-quyet-chon-can-lure-va-ky-thuat-cheo-suoi-san-ca-lang")
                        .author("WildStream Master")
                        .categoryName("Câu cá Sông")
                        .terrain("river")
                        .imageUrl("/images/river-fishing.png")
                        .htmlContent("""
                                <h2>1. Tổng quan về địa hình Sông suối & Dòng chảy</h2>
                                <p>Sông suối Đông Nam Á nổi tiếng với những dòng chảy xiết, rãnh đá ngầm sâu và thảm thực vật phong phú. Để săn được các loài cá bản địa tinh ranh như cá lăng, cá sộp hay cá chép suối, cần thủ cần trang bị sự kiên nhẫn cùng kỹ thuật đọc con nước chuyên nghiệp.</p>
                                
                                <img src="/images/river-fishing.png" alt="Câu cá sông suối" style="width:100%; border-radius:12px; margin: 16px 0;" />

                                <h2>2. Các thiết bị & Sản phẩm khuyến nghị có sẵn</h2>
                                <p>Để có một chuyến lội suối thành công, dưới đây là các trang bị tối ưu được chọn lọc trực tiếp từ kho hàng WildStream Gear:</p>
                                <ul>
                                    <li><strong>Cần câu Lure Daiwa Crossfire X 662MB:</strong> Cần máy ngang nhạy bén, đọt dẻo chịu tải cá lăng sông hiệu quả.</li>
                                    <li><strong>Cần câu cá Shimano Cruzar AX 2602:</strong> Chất liệu carbon cao cấp siêu bền, độ nảy vượt trội khi quăng mồi suối.</li>
                                    <li><strong>Ghế dã ngoại xếp gọn WildStream:</strong> Thiết kế hợp kim nhôm hàng không siêu nhẹ, dễ dàng gập gọn đeo vai khi di chuyển ven suối.</li>
                                </ul>

                                <h2>3. Mẹo an toàn khi đi sông suối</h2>
                                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                                    <strong style="color: #92400e;">Lưu ý an toàn:</strong> Luôn mặc áo phao cứu sinh khi di chuyển bằng thuyền kayak hoặc lội suối nước sâu. Tránh xa các rãnh xoáy khi trời mưa giông ở thượng nguồn.
                                </div>
                                """)
                        .isVisible(true)
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .updatedAt(LocalDateTime.now().minusDays(2))
                        .build();

                Post post2 = Post.builder()
                        .title("Chinh phục Đại dương: Kỹ thuật Jigging biển khơi & Bảo quản máy câu mặn")
                        .slug("chinh-phuc-dai-duong-ky-thuat-jigging-bien-khoi")
                        .author("Captain WildStream")
                        .categoryName("Câu cá Biển")
                        .terrain("sea")
                        .imageUrl("/images/sea-fishing.png")
                        .htmlContent("""
                                <h2>1. Sức hút của các chuyến viễn chinh biển khơi</h2>
                                <p>Câu cá biển không chỉ là một môn thể thao giải trí, mà còn là cuộc đối đầu đầy kịch tính với những loài cá săn mồi bạo lực như cá ngừ, cá thu, cá mú rạn. Điều quan trọng nhất là trang bị chống chịu được nồng độ mặn cao và áp lực kéo cực lớn.</p>
                                
                                <img src="/images/sea-fishing.png" alt="Câu cá biển khơi" style="width:100%; border-radius:12px; margin: 16px 0;" />

                                <h2>2. Các thiết bị biển khơi khuyên dùng từ WildStream</h2>
                                <ul>
                                    <li><strong>Máy câu Shimano Stella SW:</strong> Nổi tiếng thế giới với công nghệ chống nước mặn X-Protect và lực hãm khoẻ rẽ sóng.</li>
                                    <li><strong>Cần câu Carbon Daiwa Saltiga:</strong> Thân carbon xoắn X45 chịu nén cực tốt khi giật Jigging tầng đáy.</li>
                                    <li><strong>Áo thun dã ngoại chống nắng UV:</strong> Vải co giãn thoáng khí chuẩn UPF50+ bảo vệ làn da khỏi ánh nắng gay gắt trên biển.</li>
                                </ul>

                                <h2>3. Quy trình vệ sinh máy câu biển</h2>
                                <ol>
                                    <li>Rửa sạch toàn bộ thân máy bằng nước ngọt ấm ngay sau khi cập bến.</li>
                                    <li>Nút chặt núm xả cước (drag knob) để tránh nước chui vào lá phanh carbon.</li>
                                    <li>Lau khô và xịt mỡ bôi trơn chuyên dụng vào con lăn dây (line roller).</li>
                                </ol>
                                """)
                        .isVisible(true)
                        .createdAt(LocalDateTime.now().minusDays(5))
                        .updatedAt(LocalDateTime.now().minusDays(5))
                        .build();

                Post post3 = Post.builder()
                        .title("Sự tĩnh lặng của mặt hồ: Kỹ thuật câu đài & Bí quyết pha mồi nhạy cá")
                        .slug("su-tinh-lang-cua-mat-ho-ky-thuat-cau-dai-va-pha-moi")
                        .author("Cần Thủ Chuyên Nghiệp")
                        .categoryName("Câu cá Hồ")
                        .terrain("lake")
                        .imageUrl("/images/lake-fishing.png")
                        .htmlContent("""
                                <h2>1. Nghệ thuật câu đài hồ tự nhiên & hồ dịch vụ</h2>
                                <p>Hồ nước tĩnh đòi hỏi sự tinh tế tột độ từ việc đo độ sâu đáy hồ, cân phao đài nhạy đến nghệ thuật trộn mồi dịu mùi để không làm nhát những 'cụ' cá trắm đen hay cá chép tinh ranh.</p>
                                
                                <img src="/images/lake-fishing.png" alt="Câu cá hồ tĩnh" style="width:100%; border-radius:12px; margin: 16px 0;" />

                                <h2>2. Trang bị câu hồ hàng đầu</h2>
                                <ul>
                                    <li><strong>Cần câu đài Handing Nhất Long:</strong> Trọng lượng siêu nhẹ, độ phân bổ lực 28 dẻo dai giúp giữ cá lớn không đứt thẻo.</li>
                                    <li><strong>Máy câu Shimano Stradic FM:</strong> Vận hành mượt mà, rãnh chứa cước chuẩn xác cho các chuyến đài máy.</li>
                                    <li><strong>Phao câu đài Titan Float:</strong> Tín hiệu phao rõ nét, tín hiệu nháy chuẩn từng milimet khi cá chạm mồi.</li>
                                </ul>

                                <h2>3. Tỷ lệ pha mồi chuẩn cho cá chép & cá trắm</h2>
                                <p>Trộn 40% cám nền tổng hợp + 30% ngô ngọt ủ chua + 20% bột tôm thủy phân + 10% kết dính. Nhào đều tay với nước hồ tại chỗ để mồi có độ tơi xốp tự nhiên nhất.</p>
                                """)
                        .isVisible(true)
                        .createdAt(LocalDateTime.now().minusDays(8))
                        .updatedAt(LocalDateTime.now().minusDays(8))
                        .build();

                Post post4 = Post.builder()
                        .title("Nghệ thuật cắm trại mùa Thu: Hướng dẫn dựng lều 4 mùa & An toàn lửa trại")
                        .slug("nghe-thuat-cam-trai-mua-thu-huong-dan-dung-leu-4-mua")
                        .author("Chuyên Gia Dã Ngoại")
                        .categoryName("Cắm trại Dã ngoại")
                        .terrain("camping")
                        .imageUrl("/images/camping.png")
                        .htmlContent("""
                                <h2>1. Trải nghiệm cắm trại hòa mình cùng thiên nhiên</h2>
                                <p>Không khí se lạnh của mùa thu là thời điểm lý tưởng nhất để gạt bỏ âu lo công việc, cùng bạn bè dựng lều bên bờ sông hay bìa rừng để thưởng thức không gian thiên nhiên hoang sơ.</p>
                                
                                <img src="/images/camping.png" alt="Cắm trại dã ngoại" style="width:100%; border-radius:12px; margin: 16px 0;" />

                                <h2>2. Danh mục vật dụng thiết yếu từ WildStream Store</h2>
                                <ul>
                                    <li><strong>Lều thám hiểm Peak-4:</strong> Khung nhôm dẻo chịu gió cấp 7, chất liệu vải PU3000mm chống mưa tuyết tuyệt đối.</li>
                                    <li><strong>Bộ dụng cụ sinh tồn WildStream X1:</strong> Tích hợp 18 công cụ cứu sinh gồm dao carbon, đá lửa magnesium, còi cứu hộ.</li>
                                    <li><strong>Ghế dã ngoại xếp gọn WildStream:</strong> Khung hợp kim gập siêu gọn, tựa lưng thoáng khí bọc vải Oxford 600D.</li>
                                </ul>

                                <h2>3. Quy tắc 5 không bảo vệ môi trường</h2>
                                <ol>
                                    <li>Không để lại rác thải nhựa nơi cắm trại.</li>
                                    <li>Không đốt lửa trại trực tiếp trên thảm cỏ tự nhiên.</li>
                                    <li>Không gây tiếng ồn lớn ảnh hưởng đến động vật tự nhiên.</li>
                                    <li>Không xả xà phòng trực tiếp xuống nguồn nước suối.</li>
                                    <li>Không tự ý chặt phá cây rừng tươi.</li>
                                </ol>
                                """)
                        .isVisible(true)
                        .createdAt(LocalDateTime.now().minusDays(10))
                        .updatedAt(LocalDateTime.now().minusDays(10))
                        .build();

                postRepository.saveAll(List.of(post1, post2, post3, post4));
            }
        };
    }
}
