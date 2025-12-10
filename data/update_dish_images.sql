-- ============================================
-- CẬP NHẬT HÌNH ẢNH CHO TẤT CẢ MÓN ĂN
-- File này thêm image_url cho 100 món trong database
-- ============================================

USE resv01_db;

-- ============ KHAI VỊ (4 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Gỏi cuốn tôm thịt.jpg' WHERE dish_id = 1;
UPDATE dishes SET image_url = '/assets/images/img_menu/chả giò hải sản.jpg' WHERE dish_id = 2;
UPDATE dishes SET image_url = '/assets/images/img_menu/Salad dầu giấm.png' WHERE dish_id = 3;
UPDATE dishes SET image_url = '/assets/images/img_menu/Súp cua.jpg' WHERE dish_id = 4;

-- ============ MÓN CHÍNH - PHỞ BÚN VIỆT NAM (7 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/phở bò tái.jpg' WHERE dish_id = 5;
UPDATE dishes SET image_url = '/assets/images/img_menu/bun-cha-ha-noi.webp' WHERE dish_id = 6;
UPDATE dishes SET image_url = '/assets/images/img_menu/cơm tấm.jpg' WHERE dish_id = 7;
UPDATE dishes SET image_url = '/assets/images/img_menu/bò lúc lắc.jpg' WHERE dish_id = 8;
UPDATE dishes SET image_url = '/assets/images/img_menu/cá diêu hồng hấp xì dầu.jpg' WHERE dish_id = 9;
UPDATE dishes SET image_url = '/assets/images/img_menu/Lẩu Thái Tomyum.jpg' WHERE dish_id = 10;
UPDATE dishes SET image_url = '/assets/images/img_menu/Steak bò Mỹ.webp' WHERE dish_id = 11;

-- ============ MÓN CHÍNH - MÌ NHẬT BẢN (10 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì ramen Tonkotsu.jpg' WHERE dish_id = 21;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì ramen Shoyu.jpg' WHERE dish_id = 22;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì ramen Miso.jpg' WHERE dish_id = 23;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Udon tempura.jpg' WHERE dish_id = 24;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Soba lạnh.jpg' WHERE dish_id = 25;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Yakisoba xào.png' WHERE dish_id = 26;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Somen lạnh.webp' WHERE dish_id = 27;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì ramen hải sản.jpg' WHERE dish_id = 66;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì ramen chay.jpg' WHERE dish_id = 67;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì udon cà ri Nhật.png' WHERE dish_id = 69;

-- ============ MÓN CHÍNH - MÌ HÀN QUỐC (5 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Ramen cay Hàn Quốc.webp' WHERE dish_id = 28;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì jjajangmyeon.jpeg' WHERE dish_id = 29;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì kimchi bò.jpg' WHERE dish_id = 30;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì udon bò Bulgogi.jpg' WHERE dish_id = 31;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì lạnh Naengmyeon.jpg' WHERE dish_id = 32;

-- ============ MÓN CHÍNH - MÌ THÁI LAN (4 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Pad Thai tôm.webp' WHERE dish_id = 33;
UPDATE dishes SET image_url = '/assets/images/img_menu/Pad See Ew bò.webp' WHERE dish_id = 34;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì xào hải sản Thái.png' WHERE dish_id = 35;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì tom yum hải sản.webp' WHERE dish_id = 38;

-- ============ MÓN CHÍNH - MÌ SINGAPORE/MALAYSIA (5 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Laksa Singapore.jpg' WHERE dish_id = 36;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Hokkien Mee.jpg' WHERE dish_id = 37;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì xào kiểu Mã Lai.webp' WHERE dish_id = 39;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì xào Singapore curry.webp' WHERE dish_id = 40;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì gạo xào Singapore.png' WHERE dish_id = 54;

-- ============ MÓN CHÍNH - MÌ Ý & PASTA (13 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Spaghetti Carbonara.jpg' WHERE dish_id = 41;
UPDATE dishes SET image_url = '/assets/images/img_menu/Spaghetti Bolognese.jpg' WHERE dish_id = 42;
UPDATE dishes SET image_url = '/assets/images/img_menu/Spaghetti hải sản.png' WHERE dish_id = 43;
UPDATE dishes SET image_url = '/assets/images/img_menu/Fettuccine Alfredo.png' WHERE dish_id = 44;
UPDATE dishes SET image_url = '/assets/images/img_menu/Penne Arrabbiata.jpg' WHERE dish_id = 45;
UPDATE dishes SET image_url = '/assets/images/img_menu/Lasagna bò phô mai.jpg' WHERE dish_id = 46;
UPDATE dishes SET image_url = '/assets/images/img_menu/Tagliatelle nấm kem.jpg' WHERE dish_id = 47;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Ý pesto basil.webp' WHERE dish_id = 48;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Ý sốt hải sản cay.webp' WHERE dish_id = 49;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Ý chay rau củ.webp' WHERE dish_id = 50;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Ý sốt kem nấm.jpg' WHERE dish_id = 64;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Ý sốt tôm cay.png' WHERE dish_id = 65;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Ý hải sản sốt kem.jpg' WHERE dish_id = 70;

-- ============ MÓN CHÍNH - MÌ TRUNG HOA (6 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Trung Hoa xào giòn.jpg' WHERE dish_id = 51;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì hoành thánh xá xíu.jpg' WHERE dish_id = 52;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì trứng xào tôm.png' WHERE dish_id = 53;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì gà kiểu Hainan.jpg' WHERE dish_id = 55;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì xào giòn hải sản.jpg' WHERE dish_id = 62;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì xào bò sa tế.webp' WHERE dish_id = 63;

-- ============ MÓN CHÍNH - BÚN MÌ VIỆT NAM (6 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì phở xào bò.jpg' WHERE dish_id = 56;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bún bò Huế đặc biệt.jpg' WHERE dish_id = 57;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bún riêu cua.jpg' WHERE dish_id = 58;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bún thịt nướng.png' WHERE dish_id = 59;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Quảng gà.jpg' WHERE dish_id = 60;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì Quảng tôm thịt.webp' WHERE dish_id = 61;

-- ============ MÓN CHÍNH - MÌ SOBA/UDON CHAY (2 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Mì soba chay lạnh.webp' WHERE dish_id = 68;

-- ============ TRÁNG MIỆNG (10 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Chè khúc bạch.jpg' WHERE dish_id = 12;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bánh flan.jpg' WHERE dish_id = 13;
UPDATE dishes SET image_url = '/assets/images/img_menu/Rau câu dừa.jpg' WHERE dish_id = 14;
UPDATE dishes SET image_url = '/assets/images/img_menu/Tiramisu cà phê.webp' WHERE dish_id = 86;
UPDATE dishes SET image_url = '/assets/images/img_menu/Panna cotta dâu.jpg' WHERE dish_id = 87;
UPDATE dishes SET image_url = '/assets/images/img_menu/Kem vani socola.webp' WHERE dish_id = 88;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bánh cheesecake chanh dây.jpg' WHERE dish_id = 89;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bánh brownie socola.jpg' WHERE dish_id = 90;
UPDATE dishes SET image_url = '/assets/images/img_menu/Kem trà xanh matcha.jpg' WHERE dish_id = 91;
UPDATE dishes SET image_url = '/assets/images/img_menu/Chuối nếp nướng.webp' WHERE dish_id = 92;
UPDATE dishes SET image_url = '/assets/images/img_menu/Chè trôi nước.jpg' WHERE dish_id = 93;
UPDATE dishes SET image_url = '/assets/images/img_menu/Chè bưởi.jpg' WHERE dish_id = 94;
UPDATE dishes SET image_url = '/assets/images/img_menu/Kem dừa non.jpeg' WHERE dish_id = 95;

-- ============ ĐỒ UỐNG (5 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Nước chanh.webp' WHERE dish_id = 15;
UPDATE dishes SET image_url = '/assets/images/img_menu/Nước cam ép.webp' WHERE dish_id = 16;
UPDATE dishes SET image_url = '/assets/images/img_menu/Coca-Cola.avif' WHERE dish_id = 17;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bia Tiger.jpg' WHERE dish_id = 18;
UPDATE dishes SET image_url = '/assets/images/img_menu/Trà đào cam sả.webp' WHERE dish_id = 96;
UPDATE dishes SET image_url = '/assets/images/img_menu/Trà sữa trân châu.webp' WHERE dish_id = 97;
UPDATE dishes SET image_url = '/assets/images/img_menu/Nước ép táo.webp' WHERE dish_id = 98;
UPDATE dishes SET image_url = '/assets/images/img_menu/Sinh tố xoài.png' WHERE dish_id = 99;
UPDATE dishes SET image_url = '/assets/images/img_menu/Mocktail nhiệt đới.webp' WHERE dish_id = 100;

-- ============ MÓN ĂN KÈM (17 món) ============
UPDATE dishes SET image_url = '/assets/images/img_menu/Kim chi.webp' WHERE dish_id = 19;
UPDATE dishes SET image_url = '/assets/images/img_menu/Cơm trắng.webp' WHERE dish_id = 20;
UPDATE dishes SET image_url = '/assets/images/img_menu/Khoai tây chiên kiểu Pháp.jpg' WHERE dish_id = 71;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bánh mì bơ tỏi.jpg' WHERE dish_id = 72;
UPDATE dishes SET image_url = '/assets/images/img_menu/Salad Caesar.jpg' WHERE dish_id = 73;
UPDATE dishes SET image_url = '/assets/images/img_menu/Salad Hy Lạp.jpg' WHERE dish_id = 74;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bánh mì que phô mai.jpg' WHERE dish_id = 75;
UPDATE dishes SET image_url = '/assets/images/img_menu/Rau củ nướng mật ong.jpg' WHERE dish_id = 76;
UPDATE dishes SET image_url = '/assets/images/img_menu/Khoai lang chiên.jpg' WHERE dish_id = 77;
UPDATE dishes SET image_url = '/assets/images/img_menu/Gỏi xoài khô bò.jpg' WHERE dish_id = 78;
UPDATE dishes SET image_url = '/assets/images/img_menu/Ngô chiên bơ.webp' WHERE dish_id = 79;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bánh bao chiên.webp' WHERE dish_id = 80;
UPDATE dishes SET image_url = '/assets/images/img_menu/Kim chi củ cải.jpg' WHERE dish_id = 81;
UPDATE dishes SET image_url = '/assets/images/img_menu/Đậu hũ chiên giòn.jpg' WHERE dish_id = 82;
UPDATE dishes SET image_url = '/assets/images/img_menu/Bắp non xào bơ tỏi.png' WHERE dish_id = 83;
UPDATE dishes SET image_url = '/assets/images/img_menu/Xà lách trộn dầu giấm.jpg' WHERE dish_id = 84;
UPDATE dishes SET image_url = '/assets/images/img_menu/Khoai tây nghiền bơ.jpg' WHERE dish_id = 85;

-- ============================================
-- TỔNG KẾT: Đã cập nhật 100 món ăn
-- ============================================

SELECT 'Đã cập nhật hình ảnh cho 100 món ăn thành công!' AS status;
