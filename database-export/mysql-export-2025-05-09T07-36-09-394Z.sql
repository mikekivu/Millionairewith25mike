-- MySQL compatible export generated on 2025-05-09T07:36:09.396Z
-- MillionareWith$25 Database Backup

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Table structure for table `contact_messages`
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `first_name` TEXT NOT NULL,
  `last_name` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `subject` TEXT NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `investments`
DROP TABLE IF EXISTS `investments`;
CREATE TABLE `investments` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` INT NOT NULL,
  `plan_id` INT NOT NULL,
  `amount` DECIMAL(18,8) NOT NULL,
  `status` TEXT NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` TIMESTAMP NOT NULL,
  `profit` DECIMAL(18,8) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `payment_settings`
DROP TABLE IF EXISTS `payment_settings`;
CREATE TABLE `payment_settings` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `payment_method` TEXT NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `wallet_address` TEXT,
  `api_key` TEXT,
  `secret_key` TEXT,
  `method` TEXT NOT NULL DEFAULT 'paypal',
  `name` TEXT NOT NULL DEFAULT 'Payment Method',
  `instructions` TEXT,
  `credentials` TEXT,
  `min_amount` TEXT NOT NULL DEFAULT '10',
  `max_amount` TEXT NOT NULL DEFAULT '10000',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `payment_settings`
INSERT INTO `payment_settings` (`id`, `payment_method`, `active`, `wallet_address`, `api_key`, `secret_key`, `method`, `name`, `instructions`, `credentials`, `min_amount`, `max_amount`) VALUES (1, 'paypal', 1, '', 'AUuVpRN2jT2d5G8iu2eLY7WR_lgMkShROBT0khHlJo8fC6M_3S2DfgZA8pQVVIn6ogmWMoH-4Wo-w8o2', 'AUuVpRN2jT2d5G8iu2eLY7WR_lgMkShROBT0khHlJo8fC6M_3S2DfgZA8pQVVIn6ogmWMoH-4Wo-w8o2', 'paypal', 'Payment Method', NULL, NULL, '10', '10000');
INSERT INTO `payment_settings` (`id`, `payment_method`, `active`, `wallet_address`, `api_key`, `secret_key`, `method`, `name`, `instructions`, `credentials`, `min_amount`, `max_amount`) VALUES (2, 'coinbase', 1, 'TUt1RB8XL91QZeEPrY62QGYvM3raCUUJJb', '', '', 'paypal', 'Payment Method', NULL, NULL, '10', '10000');

-- Table structure for table `plans`
DROP TABLE IF EXISTS `plans`;
CREATE TABLE `plans` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `monthly_rate` DECIMAL(18,8) NOT NULL,
  `min_deposit` DECIMAL(18,8) NOT NULL,
  `max_deposit` DECIMAL(18,8) NOT NULL,
  `duration_days` INT NOT NULL,
  `features` ARRAY,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `plans`
INSERT INTO `plans` (`id`, `name`, `description`, `monthly_rate`, `min_deposit`, `max_deposit`, `duration_days`, `features`, `active`) VALUES (1, 'Basic', 'Perfect for beginners looking to start their investment journey.', '5.00', '100.00000000', '1000.00000000', 30, Min Deposit: 100 USDT,Max Deposit: 1,000 USDT,Duration: 30 days,24/7 Support, 1);
INSERT INTO `plans` (`id`, `name`, `description`, `monthly_rate`, `min_deposit`, `max_deposit`, `duration_days`, `features`, `active`) VALUES (2, 'Standard', 'Our most popular plan for active investors.', '8.00', '1000.00000000', '10000.00000000', 30, Min Deposit: 1,000 USDT,Max Deposit: 10,000 USDT,Duration: 30 days,24/7 Support + Financial Advisor, 1);
INSERT INTO `plans` (`id`, `name`, `description`, `monthly_rate`, `min_deposit`, `max_deposit`, `duration_days`, `features`, `active`) VALUES (3, 'Premium', 'For serious investors seeking maximum returns.', '12.00', '10000.00000000', '50000.00000000', 30, Min Deposit: 10,000 USDT,Max Deposit: 50,000 USDT,Duration: 30 days,VIP Support + Dedicated Manager, 1);

-- Table structure for table `referrals`
DROP TABLE IF EXISTS `referrals`;
CREATE TABLE `referrals` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `referrer_id` INT NOT NULL,
  `referred_id` INT NOT NULL,
  `level` INT NOT NULL,
  `commission_rate` DECIMAL(18,8) NOT NULL,
  `commission_amount` DECIMAL(18,8) NOT NULL DEFAULT '0',
  `status` TEXT NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `referrals`
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (2, 1, 2, 1, '10.00', '50.00000000', 'active', '2025-05-08 10:31:39');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (3, 2, 3, 1, '10.00', '25.00000000', 'active', '2025-05-08 10:31:39');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (4, 1, 3, 2, '5.00', '10.00000000', 'active', '2025-05-08 10:31:39');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (5, 3, 4, 1, '10.00', '15.00000000', 'active', '2025-05-08 10:31:39');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (6, 2, 4, 2, '5.00', '5.00000000', 'active', '2025-05-08 10:31:40');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (7, 1, 4, 3, '3.00', '3.00000000', 'active', '2025-05-08 10:31:40');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (8, 3, 9, 1, '10.00', '0.00000000', 'active', '2025-05-08 11:08:55');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (9, 2, 9, 2, '5.00', '0.00000000', 'active', '2025-05-08 11:08:55');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (10, 1, 9, 3, '3.00', '0.00000000', 'active', '2025-05-08 11:08:55');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (11, 22, 24, 1, '10.00', '0.00000000', 'active', '2025-05-08 21:34:41');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (12, 3, 25, 1, '10.00', '0.00000000', 'active', '2025-05-08 22:10:57');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (13, 2, 25, 2, '5.00', '0.00000000', 'active', '2025-05-08 22:10:58');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (14, 1, 25, 3, '3.00', '0.00000000', 'active', '2025-05-08 22:10:58');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (15, 3, 25, 1, '10.00', '0.00000000', 'active', '2025-05-08 22:10:58');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (16, 2, 25, 2, '5.00', '0.00000000', 'active', '2025-05-08 22:10:58');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (17, 1, 25, 3, '3.00', '0.00000000', 'active', '2025-05-08 22:10:58');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (18, 25, 26, 1, '10.00', '0.00000000', 'active', '2025-05-08 22:14:12');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (19, 3, 26, 2, '5.00', '0.00000000', 'active', '2025-05-08 22:14:12');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (20, 2, 26, 3, '3.00', '0.00000000', 'active', '2025-05-08 22:14:12');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (21, 1, 26, 4, '2.00', '0.00000000', 'active', '2025-05-08 22:14:12');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (22, 25, 26, 1, '10.00', '0.00000000', 'active', '2025-05-08 22:14:12');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (23, 3, 26, 2, '5.00', '0.00000000', 'active', '2025-05-08 22:14:12');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (24, 2, 26, 3, '3.00', '0.00000000', 'active', '2025-05-08 22:14:12');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (25, 1, 26, 4, '2.00', '0.00000000', 'active', '2025-05-08 22:14:12');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (26, 26, 27, 1, '10.00', '0.00000000', 'active', '2025-05-08 22:36:26');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (27, 25, 27, 2, '5.00', '0.00000000', 'active', '2025-05-08 22:36:26');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (28, 3, 27, 3, '3.00', '0.00000000', 'active', '2025-05-08 22:36:26');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (29, 2, 27, 4, '2.00', '0.00000000', 'active', '2025-05-08 22:36:26');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (30, 1, 27, 5, '1.00', '0.00000000', 'active', '2025-05-08 22:36:26');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (31, 26, 27, 1, '10.00', '0.00000000', 'active', '2025-05-08 22:36:26');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (32, 25, 27, 2, '5.00', '0.00000000', 'active', '2025-05-08 22:36:26');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (33, 3, 27, 3, '3.00', '0.00000000', 'active', '2025-05-08 22:36:27');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (34, 2, 27, 4, '2.00', '0.00000000', 'active', '2025-05-08 22:36:27');
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `level`, `commission_rate`, `commission_amount`, `status`, `created_at`) VALUES (35, 1, 27, 5, '1.00', '0.00000000', 'active', '2025-05-08 22:36:27');

-- Table structure for table `transactions`
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` INT NOT NULL,
  `type` TEXT NOT NULL,
  `amount` DECIMAL(18,8) NOT NULL,
  `currency` TEXT NOT NULL DEFAULT 'USDT',
  `status` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` TEXT,
  `transaction_details` TEXT,
  `investment_id` INT,
  `referral_id` INT,
  `payment_proof` TEXT,
  `external_transaction_id` TEXT,
  `processed_at` TIMESTAMP,
  `processed_by` INT,
  `admin_notes` TEXT,
  `receipt_id` TEXT,
  `receipt_url` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `transactions`
INSERT INTO `transactions` (`id`, `user_id`, `type`, `amount`, `currency`, `status`, `created_at`, `payment_method`, `transaction_details`, `investment_id`, `referral_id`, `payment_proof`, `external_transaction_id`, `processed_at`, `processed_by`, `admin_notes`, `receipt_id`, `receipt_url`) VALUES (1, 3, 'deposit', '6.00000000', 'USDT', 'pending', '2025-05-08 22:19:36', 'paypal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `transactions` (`id`, `user_id`, `type`, `amount`, `currency`, `status`, `created_at`, `payment_method`, `transaction_details`, `investment_id`, `referral_id`, `payment_proof`, `external_transaction_id`, `processed_at`, `processed_by`, `admin_notes`, `receipt_id`, `receipt_url`) VALUES (2, 3, 'deposit', '100.00000000', 'USDT', 'pending', '2025-05-08 22:39:26', 'paypal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `username` TEXT NOT NULL,
  `password` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `first_name` TEXT NOT NULL,
  `last_name` TEXT NOT NULL,
  `wallet_balance` DECIMAL(18,8) NOT NULL DEFAULT '0',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `role` TEXT NOT NULL DEFAULT 'user',
  `referral_code` TEXT NOT NULL,
  `referred_by` INT,
  `profile_image` TEXT,
  `country` TEXT,
  `phone_number` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (1, 'admin', '$2b$10$8D0qqMQHtE2TLM6rVe8NtedHCZzCBTr.YFVH58oDMuPWipJptdHVa', 'admin@richlance.com', 'Admin', 'User', '0.00000000', 1, 'admin', 'ADMIN5MEsnlUA', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (5, 'mikekivu5', '$2b$10$SAPI4kIGWgkZru6U2I5iy.c1SfXOFBArJR12d484O.3yvJiTbJUwi', 'mikekivu5@gmail.com', 'mike2', 'Kivu', '0.00000000', 1, 'user', 'MIKEKIVU5qpw4bq', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (6, 'makuthum', '$2b$10$dIN0QoSxXbyWxvPJLjJXseI7lZv/XgKGRzbXKvLetsGvj9AcGFFpO', 'mikekivu6@gmail.com', 'makuthu', 'makuthu', '0.00000000', 1, 'user', 'MAKUTHUMvwkrzg', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (7, 'webexpertkenya@gmail.com', '$2b$10$lCQBFEXlvAnkNjcW8TSpeOshshqMsVPjSO8HlMOjYmd3DrJQAOcmS', 'webexpertkenya@gmail.com', 'mutua', 'jj', '0.00000000', 1, 'user', 'WEBEXPERTKENYA@GMAIL.COM81ekjw', 3, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (2, 'testuser', '$2b$10$60MHohtrScyPh6q8UHkC4OkE3QbumyxdpYgTFcGB4IcagYHD3tNGO', 'test@example.com', 'Test', 'User', '0.00000000', 1, 'user', 'TESTUSERhkjknm', 1, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (4, 'mikekivu3', '$2b$10$DsDNjBwIqrTWLN1.Y5qdVOOrotdVUSdgFN9xWoKEoLwdViqpnCnry', 'mikekivu3@gmail.com', 'mike2', 'Kivu', '0.00000000', 1, 'user', 'MIKEKIVU37td72g', 3, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (8, 'webexpertsolutions', '$2b$10$7COgAmTqvv4HrOGbcA/YYuj4SGbq7/RedAkH3A3q5lNozUSaOH9/u', 'info@webexpertsolutions.co.ke', 'brian', 'ndeleva', '0.00000000', 1, 'user', 'WEBEXPERTSOLUTIONS5xem1k', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (9, 'webexpert', '$2b$10$cIkQYcU5CqJFpsun70dXFePNpugkHQEU8tDZ0UQPpsUCJPJryj03C', 'mike@webexpertsolutions.co.ke', 'web ', 'expert', '0.00000000', 1, 'user', 'WEBEXPERTxtdyug', 3, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (10, 'mohaabdi', '$2b$10$ng2LTmUBEaq0tDMAO0Tq9.9.8prdl3.MvOqHxtE18LvDJWEvL5FIC', 'mohaabdi555@gmail.com', 'moha', 'abdi', '0.00000000', 1, 'user', 'MOHAABDI43gx3d', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (12, 'musyoka', '$2b$10$.xZwkfo7xDPIYbFQJq7xsu./7docv3G.pbRoPDlUHAbBDPd8x1Uv2', 'musyoka66666@gmail.com', 'musyoka', 'mueke', '0.00000000', 1, 'user', 'MUSYOKAnx1ahc', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (13, 'marie', '$2b$10$XAeX9Wqhl44Wdq78ldkOj.VNsJwImw2ZJVmUFyDL9PisHmfukp8u6', 'marie7868@gmail.com', 'marie', 'Marie', '0.00000000', 1, 'user', 'MARIEgy083o', NULL, NULL, 'kenya', '7809786757');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (14, 'jose', '$2b$10$xf2LV6fbRJnqC5tpErbw1e4dq9/8wWAvyJRjgB6RDJS9xQeKu.6rm', 'jose@webexpertsolutions.co.ke', 'jose', 'jose', '0.00000000', 1, 'user', 'JOSEhp330r', NULL, NULL, 'kenya', '076565665');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (15, 'mamabo', '$2b$10$3To7P4LC2U4ashvQHQDwZuzlYOXPn9fXztxPKD616Ctyuez0/PEya', 'mambomtinda456342@gmail.com', 'mambo', 'mutinda', '0.00000000', 1, 'user', 'MAMABOksvwaw', NULL, NULL, 'kenya', '97642146788');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (16, 'vundi', '$2b$10$vWxrtpjKZuO/bqbjhqmHKuaEkeLIR/IJS54Gmp1gDIPf1s/VW.57e', 'vundi@gmail.com', 'vundi', 'vundi', '0.00000000', 1, 'user', 'VUNDIe1hbzj', NULL, NULL, 'kenya', '541678289');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (17, 'wambua', '$2b$10$FfEco8xBUCVeDQOWlAnjIOypw4aloCqGSvJuhUe0DoH.4jQ4mzR06', 'wambua@gmail.com', 'wambua', 'wa', '0.00000000', 1, 'user', 'WAMBUAh61oiv', NULL, NULL, 'kenya', '0865438987');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (18, 'musyokawa', '$2b$10$7XAyKJXZJGRscIhWo/2kNuOpo8audgtQ8UmzBxREJe72HBhwUWfLW', 'musyoka@gmail.com', 'musyoka', 'mmm', '0.00000000', 1, 'user', 'MUSYOKAWAhjhtr4', NULL, NULL, 'kenya', '1435237717');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (19, 'dkdenniskorir', '$2b$10$AH614FOSpSQJWSff1EUft.PDiuqYtOtbeta6pZ8o45SZWq6B//X/W', 'dkdenniskorir66@gmail.com', 'michael', 'paul', '0.00000000', 1, 'user', 'DKDENNISKORIReo4e8u', NULL, NULL, 'Kenya', '0746942707');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (20, 'mutetidavid45632', '$2b$10$n.GxeNX/HxWXSHvFv3L71e9t5SxyLhMO8iXtvMFO.sgd7Ml2rKMCW', 'mutetidavid45632@gmail.com', 'muteti', 'david', '0.00000000', 1, 'user', 'MUTETIDAVID4563262t3h8', NULL, NULL, 'kenya', '564785656');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (21, 'makoha', '$2b$10$KxYFMJyJlyVAojBbFBTTBuT8hwX5sK6A./jLBzLSjZDEgn2M/pEvy', 'makohadenis564@gmail.com', 'makaha', 'denis', '0.00000000', 1, 'user', 'MAKOHAfncfod', NULL, NULL, 'kenya', '0745536445');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (11, 'mutuadoe@gmail.com', '$2b$10$y623VyfEkfcY3znlcXPUeugMKoby6GyIMcwiPo/WaHlNi2MIBlu0O', 'mutuadoe@gmail.com', 'mutua', 'Doe', '0.00000000', 0, 'user', 'MUTUADOE@GMAIL.COMu0gpoz', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (22, 'peter', '$2b$10$/EqT3ZLOS0UJbMw4CpGZieebb7O4wSwzWyNdoLSYkEarHUOrX8Iby', 'petermkyu@gmail.com', 'peter', 'mk', '0.00000000', 1, 'user', 'PETERmovnfn', NULL, NULL, 'kenya', '1234567');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (23, 'tea', '$2b$10$oPC4/DlG4supjcPbx396Q.OJn9xD1ZAz7a3u71EVBBW/VIzvPD58u', 'tea78765@gmail.com', 'tea', 'Kivu', '0.00000000', 1, 'user', 'TEAs9w536', NULL, NULL, 'Kenya', '0786544543');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (24, 'mativo', '$2b$10$5DfidvcbnbBRhH25JufdUOGoN5.PCtDdGPy7axxh6pX1ZdU2fBZA.', 'mativo6768@gmail.com', 'mativo', 'mativo', '0.00000000', 1, 'user', 'MATIVO0k8x2w', 22, NULL, 'kenya', '07868645776');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (3, 'mikepaul', '$2b$10$RaINHef57rVP0d7bFVqzGOYQ3f/QfcKrtVh7OMRnQAzQZjt4zCHVK', 'mikepaul620@gmail.com', 'Mike', 'Paul', '0.00000000', 1, 'member', 'MIKEPAUL1bpilc', 2, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (25, 'mainamaina', '$2b$10$bwMWV.drHG8LBZkcI6R2Ve/HVTfSKvwpvsN.j8X00ng0ndJx2G7dC', 'mainamaina@gmail.com', 'maina', 'maina', '0.00000000', 1, 'user', 'MAINAMAINAenmrb1', 3, NULL, 'Kenya', '7868645776');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (26, 'jacobjacob', '$2b$10$oXErcA59P42QGATrNGn4GeGEEJ7Ywt4xymXfQZ4vCrZQXEJbk.vjm', 'jacobjacob@gmail.com', 'jacob', 'jacob', '0.00000000', 1, 'user', 'JACOBJACOBfqhec0', 25, NULL, 'kenya', '5623784878');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (27, 'janetjanet@', '$2b$10$hvfDjL4iFRRWHPNp84C/COg5d7nGhpGz6KspkQbxacP89B3NPJ9l2', 'janetjanet@gmail.com', 'janet', 'janet', '0.00000000', 1, 'user', 'JANETJANET@yailwt', 26, NULL, 'kenya', '5675283993');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `wallet_balance`, `active`, `role`, `referral_code`, `referred_by`, `profile_image`, `country`, `phone_number`) VALUES (28, 'webexpertkenya', '$2b$10$zA6jg8.uQ94eKn/v9J1vluZNgCjpLMQMIGezLWIneCjHykva/L2Q6', 'webexperkenya@gmail.com', 'Web', 'Expert', '0.00000000', 1, 'admin', 'WEBEXPERTefCiJV', NULL, NULL, NULL, NULL);

-- Foreign key constraints
ALTER TABLE `investments` ADD CONSTRAINT `investments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
ALTER TABLE `investments` ADD CONSTRAINT `investments_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`);
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_id_users_id_fk` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`);
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referred_id_users_id_fk` FOREIGN KEY (`referred_id`) REFERENCES `users` (`id`);
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_investment_id_investments_id_fk` FOREIGN KEY (`investment_id`) REFERENCES `investments` (`id`);
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_referral_id_referrals_id_fk` FOREIGN KEY (`referral_id`) REFERENCES `referrals` (`id`);
ALTER TABLE `users` ADD CONSTRAINT `users_referred_by_users_id_fk` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`);
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_processed_by_fkey` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`);
