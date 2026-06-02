-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 02 Jun 2026 pada 17.40
-- Versi server: 8.0.30
-- Versi PHP: 8.3.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Basis data: `beauty_clinic`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `weight` int DEFAULT '0',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `image` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `marketplace_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `discount_percentage` int DEFAULT '0' COMMENT 'Persentase diskon (0-100)',
  `promo_start_date` date DEFAULT NULL COMMENT 'Tanggal mulai promo',
  `promo_end_date` date DEFAULT NULL COMMENT 'Tanggal akhir promo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `price`, `weight`, `description`, `image`, `marketplace_links`, `created_at`, `updated_at`, `discount_percentage`, `promo_start_date`, `promo_end_date`) VALUES
(6, 'NEW Pronafa Facial Wash Bright Radiance Gentle Cleanser', 'NEW ARRIVAL', 87000.00, 100, '', 'https://down-id.img.susercontent.com/file/id-11134207-8224u-mjguvuxug0ea24@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/NEW-Pronafa-Facial-Wash-Bright-Radiance-Gentle-Cleanser-i.30537580.52304512213?extraParams=%7B%22display_model_id%22%3A445421923498%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:08:11', '2026-06-02 17:08:28', 0, NULL, NULL),
(7, 'NEW Pronafa Protect Sunscreen Cream Sunblock BPOM Untuk Semua Jenis Kulit', 'NEW ARRIVAL', 87000.00, 25, '', 'https://down-id.img.susercontent.com/file/id-11134207-8224r-mjguvuxulmo246@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/-NEW-Pronafa-Protect-Sunscreen-Cream-Sunblock-BPOM-Untuk-Semua-Jenis-Kulit-i.30537580.50654503110?extraParams=%7B%22display_model_id%22%3A395422040457%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:10:38', '2026-06-02 17:10:38', 0, NULL, NULL),
(8, 'NEW Pronafa Derma Mist Multi & Glow Advance Moisturizing Face Mist BPOM', 'NEW ARRIVAL', 99000.00, 100, '', 'https://down-id.img.susercontent.com/file/id-11134207-8224s-mjguvuxphm9t89@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/NEW-Pronafa-Derma-Mist-Multi-Glow-Advance-Moisturizing-Face-Mist-BPOM-i.30537580.40077965648?extraParams=%7B%22display_model_id%22%3A430421974650%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:14:20', '2026-06-02 17:14:20', 0, NULL, NULL),
(9, 'NEW Pronafa Serum Red Booster Calming & Brightening Mencerahkan Kulit BPOM', 'NEW ARRIVAL', 165000.00, 20, '', 'https://down-id.img.susercontent.com/file/id-11134207-82251-mjguvuxun18i11@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/-NEW-Pronafa-Serum-Red-Booster-Calming-Brightening-Mencerahkan-Kulit-BPOM-i.30537580.57854503039?extraParams=%7B%22display_model_id%22%3A177375543428%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:15:59', '2026-06-02 17:15:59', 0, NULL, NULL),
(10, 'Pronafa Micellar Water Pembersih Make up Dan Wajah BPOM', 'NEW ARRIVAL', 95000.00, 100, '', 'https://down-id.img.susercontent.com/file/id-11134207-8224p-mimiwjvbmiv5ea@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/Pronafa-Micellar-Water-Pembersih-Make-up-Dan-Wajah-BPOM-i.30537580.47551539323?extraParams=%7B%22display_model_id%22%3A330140262262%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:17:19', '2026-06-02 17:17:38', 0, NULL, NULL),
(11, 'NEW Pronafa Whitening Body Lotion Advance Moisturizing Mencerahkan Melembabkan Kulit', 'NEW ARRIVAL', 90000.00, 200, '', 'https://down-id.img.susercontent.com/file/id-11134207-8224w-mimiwjv4g2dg38@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/-NEW-Pronafa-Whitening-Body-Lotion-Advance-Moisturizing-Mencerahkan-Melembabkan-Kulit-i.30537580.53301448710?extraParams=%7B%22display_model_id%22%3A335908863612%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:19:54', '2026-06-02 17:19:54', 0, NULL, NULL),
(12, 'Pronafa Acne Care Sunscreen Sunblock Wajah Untuk Kulit Berjerawat SPF 20 PA+++ BPOM', 'Best Seller', 85000.00, 10, '', 'https://down-id.img.susercontent.com/file/id-11134207-8224y-mjpachqwfo5e04@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/Pronafa-Acne-Care-Sunscreen-Sunblock-Wajah-Untuk-Kulit-Berjerawat-SPF-20-PA-BPOM-i.30537580.9397837183?extraParams=%7B%22display_model_id%22%3A385536009609%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:23:32', '2026-06-02 17:25:22', 0, NULL, NULL),
(13, 'Pronafa Acne Calming Night Gel Cream Krim Malam Anti Jerawat BPOM', 'ACNE', 105000.00, 10, '', 'https://down-id.img.susercontent.com/file/id-11134207-7rasg-m50zeal9ysnx22@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/Pronafa-Acne-Calming-Night-Gel-Cream-Krim-Malam-Anti-Jerawat-BPOM-i.30537580.28171398582?extraParams=%7B%22display_model_id%22%3A185662966295%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:27:56', '2026-06-02 17:27:56', 0, NULL, NULL),
(14, 'Pronafa Retinol Glow Up Night Cream BPOM Krim Pelembab Malam Anti Penuaan Dini Mencerahkan Wajah', 'BRIGHTENING', 155000.00, 10, '', 'https://down-id.img.susercontent.com/file/id-11134207-7rasd-m63jelvxhpqwee@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/Pronafa-Retinol-Glow-Up-Night-Cream-BPOM-Krim-Pelembab-Malam-Anti-Penuaan-Dini-Mencerahkan-Wajah-i.30537580.27313570306?extraParams=%7B%22display_model_id%22%3A139092260413%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:30:10', '2026-06-02 17:30:10', 0, NULL, NULL),
(15, 'Pronafa Ection Hydra Glowing Serum Kulit Kering Memperbaiki Skin Barrier Anti Inflamasi', 'BRIGHTENING', 187500.00, 10, '', 'https://down-id.img.susercontent.com/file/id-11134207-7rasj-m64zmr902w3qe1@resize_w900_nl.webp', '{\"shopee\":\"https://shopee.co.id/Pronafa-Ection-Hydra-Glowing-Serum-Kulit-Kering-Memperbaiki-Skin-Barrier-Anti-Inflamasi-i.30537580.13967135658?extraParams=%7B%22display_model_id%22%3A123481521167%2C%22model_selection_logic%22%3A3%7D\",\"tokopedia\":\"\",\"lazada\":\"\",\"other\":\"\"}', '2026-06-02 17:31:43', '2026-06-02 17:31:43', 0, NULL, NULL);

--
-- Indeks untuk tabel yang dibuang
--

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_price` (`price`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
