-- Database export generated on 2025-05-09T07:16:58.947Z
-- MillionareWith$25 Database Backup

-- Table: contact_messages
DROP TABLE IF EXISTS contact_messages CASCADE;
CREATE TABLE contact_messages (
  id integer DEFAULT nextval('contact_messages_id_seq'::regclass) NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  responded boolean DEFAULT false NOT NULL
);

ALTER TABLE contact_messages ADD PRIMARY KEY (id);

SELECT setval('public.contact_messages_id_seq', 1, true);

-- Table: investments
DROP TABLE IF EXISTS investments CASCADE;
CREATE TABLE investments (
  id integer DEFAULT nextval('investments_id_seq'::regclass) NOT NULL,
  user_id integer NOT NULL,
  plan_id integer NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'active'::text NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  end_date timestamp without time zone NOT NULL,
  profit numeric DEFAULT '0'::numeric NOT NULL
);

ALTER TABLE investments ADD PRIMARY KEY (id);

SELECT setval('public.investments_id_seq', 1, true);

-- Table: payment_settings
DROP TABLE IF EXISTS payment_settings CASCADE;
CREATE TABLE payment_settings (
  id integer DEFAULT nextval('payment_settings_id_seq'::regclass) NOT NULL,
  payment_method text NOT NULL,
  active boolean DEFAULT true NOT NULL,
  wallet_address text,
  api_key text,
  secret_key text,
  method text DEFAULT 'paypal'::text NOT NULL,
  name text DEFAULT 'Payment Method'::text NOT NULL,
  instructions text,
  credentials text,
  min_amount text DEFAULT '10'::text NOT NULL,
  max_amount text DEFAULT '10000'::text NOT NULL
);

ALTER TABLE payment_settings ADD PRIMARY KEY (id);

-- Data for table: payment_settings
INSERT INTO payment_settings (id, payment_method, active, wallet_address, api_key, secret_key, method, name, instructions, credentials, min_amount, max_amount) VALUES (1, 'paypal', true, '', 'AUuVpRN2jT2d5G8iu2eLY7WR_lgMkShROBT0khHlJo8fC6M_3S2DfgZA8pQVVIn6ogmWMoH-4Wo-w8o2', 'AUuVpRN2jT2d5G8iu2eLY7WR_lgMkShROBT0khHlJo8fC6M_3S2DfgZA8pQVVIn6ogmWMoH-4Wo-w8o2', 'paypal', 'Payment Method', NULL, NULL, '10', '10000');
INSERT INTO payment_settings (id, payment_method, active, wallet_address, api_key, secret_key, method, name, instructions, credentials, min_amount, max_amount) VALUES (2, 'coinbase', true, 'TUt1RB8XL91QZeEPrY62QGYvM3raCUUJJb', '', '', 'paypal', 'Payment Method', NULL, NULL, '10', '10000');

SELECT setval('public.payment_settings_id_seq', 11, true);

-- Table: plans
DROP TABLE IF EXISTS plans CASCADE;
CREATE TABLE plans (
  id integer DEFAULT nextval('plans_id_seq'::regclass) NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  monthly_rate numeric NOT NULL,
  min_deposit numeric NOT NULL,
  max_deposit numeric NOT NULL,
  duration_days integer NOT NULL,
  features ARRAY,
  active boolean DEFAULT true NOT NULL
);

ALTER TABLE plans ADD PRIMARY KEY (id);

-- Data for table: plans
INSERT INTO plans (id, name, description, monthly_rate, min_deposit, max_deposit, duration_days, features, active) VALUES (1, 'Basic', 'Perfect for beginners looking to start their investment journey.', '5.00', '100.00000000', '1000.00000000', 30, Min Deposit: 100 USDT,Max Deposit: 1,000 USDT,Duration: 30 days,24/7 Support, true);
INSERT INTO plans (id, name, description, monthly_rate, min_deposit, max_deposit, duration_days, features, active) VALUES (2, 'Standard', 'Our most popular plan for active investors.', '8.00', '1000.00000000', '10000.00000000', 30, Min Deposit: 1,000 USDT,Max Deposit: 10,000 USDT,Duration: 30 days,24/7 Support + Financial Advisor, true);
INSERT INTO plans (id, name, description, monthly_rate, min_deposit, max_deposit, duration_days, features, active) VALUES (3, 'Premium', 'For serious investors seeking maximum returns.', '12.00', '10000.00000000', '50000.00000000', 30, Min Deposit: 10,000 USDT,Max Deposit: 50,000 USDT,Duration: 30 days,VIP Support + Dedicated Manager, true);

SELECT setval('public.plans_id_seq', 3, true);

-- Table: referrals
DROP TABLE IF EXISTS referrals CASCADE;
CREATE TABLE referrals (
  id integer DEFAULT nextval('referrals_id_seq'::regclass) NOT NULL,
  referrer_id integer NOT NULL,
  referred_id integer NOT NULL,
  level integer NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric DEFAULT '0'::numeric NOT NULL,
  status text DEFAULT 'active'::text NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE referrals ADD PRIMARY KEY (id);

-- Data for table: referrals
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (2, 1, 2, 1, '10.00', '50.00000000', 'active', '2025-05-08T10:31:39.751Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (3, 2, 3, 1, '10.00', '25.00000000', 'active', '2025-05-08T10:31:39.849Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (4, 1, 3, 2, '5.00', '10.00000000', 'active', '2025-05-08T10:31:39.892Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (5, 3, 4, 1, '10.00', '15.00000000', 'active', '2025-05-08T10:31:39.982Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (6, 2, 4, 2, '5.00', '5.00000000', 'active', '2025-05-08T10:31:40.025Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (7, 1, 4, 3, '3.00', '3.00000000', 'active', '2025-05-08T10:31:40.075Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (8, 3, 9, 1, '10.00', '0.00000000', 'active', '2025-05-08T11:08:55.413Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (9, 2, 9, 2, '5.00', '0.00000000', 'active', '2025-05-08T11:08:55.594Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (10, 1, 9, 3, '3.00', '0.00000000', 'active', '2025-05-08T11:08:55.637Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (11, 22, 24, 1, '10.00', '0.00000000', 'active', '2025-05-08T21:34:41.869Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (12, 3, 25, 1, '10.00', '0.00000000', 'active', '2025-05-08T22:10:57.959Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (13, 2, 25, 2, '5.00', '0.00000000', 'active', '2025-05-08T22:10:58.159Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (14, 1, 25, 3, '3.00', '0.00000000', 'active', '2025-05-08T22:10:58.206Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (15, 3, 25, 1, '10.00', '0.00000000', 'active', '2025-05-08T22:10:58.254Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (16, 2, 25, 2, '5.00', '0.00000000', 'active', '2025-05-08T22:10:58.348Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (17, 1, 25, 3, '3.00', '0.00000000', 'active', '2025-05-08T22:10:58.442Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (18, 25, 26, 1, '10.00', '0.00000000', 'active', '2025-05-08T22:14:12.144Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (19, 3, 26, 2, '5.00', '0.00000000', 'active', '2025-05-08T22:14:12.417Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (20, 2, 26, 3, '3.00', '0.00000000', 'active', '2025-05-08T22:14:12.460Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (21, 1, 26, 4, '2.00', '0.00000000', 'active', '2025-05-08T22:14:12.503Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (22, 25, 26, 1, '10.00', '0.00000000', 'active', '2025-05-08T22:14:12.660Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (23, 3, 26, 2, '5.00', '0.00000000', 'active', '2025-05-08T22:14:12.799Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (24, 2, 26, 3, '3.00', '0.00000000', 'active', '2025-05-08T22:14:12.885Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (25, 1, 26, 4, '2.00', '0.00000000', 'active', '2025-05-08T22:14:12.970Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (26, 26, 27, 1, '10.00', '0.00000000', 'active', '2025-05-08T22:36:26.458Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (27, 25, 27, 2, '5.00', '0.00000000', 'active', '2025-05-08T22:36:26.728Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (28, 3, 27, 3, '3.00', '0.00000000', 'active', '2025-05-08T22:36:26.774Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (29, 2, 27, 4, '2.00', '0.00000000', 'active', '2025-05-08T22:36:26.819Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (30, 1, 27, 5, '1.00', '0.00000000', 'active', '2025-05-08T22:36:26.864Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (31, 26, 27, 1, '10.00', '0.00000000', 'active', '2025-05-08T22:36:26.909Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (32, 25, 27, 2, '5.00', '0.00000000', 'active', '2025-05-08T22:36:26.999Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (33, 3, 27, 3, '3.00', '0.00000000', 'active', '2025-05-08T22:36:27.089Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (34, 2, 27, 4, '2.00', '0.00000000', 'active', '2025-05-08T22:36:27.180Z');
INSERT INTO referrals (id, referrer_id, referred_id, level, commission_rate, commission_amount, status, created_at) VALUES (35, 1, 27, 5, '1.00', '0.00000000', 'active', '2025-05-08T22:36:27.269Z');

SELECT setval('public.referrals_id_seq', 35, true);

-- Table: transactions
DROP TABLE IF EXISTS transactions CASCADE;
CREATE TABLE transactions (
  id integer DEFAULT nextval('transactions_id_seq'::regclass) NOT NULL,
  user_id integer NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USDT'::text NOT NULL,
  status text NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  payment_method text,
  transaction_details text,
  investment_id integer,
  referral_id integer,
  payment_proof text,
  external_transaction_id text,
  processed_at timestamp without time zone,
  processed_by integer,
  admin_notes text,
  receipt_id text,
  receipt_url text
);

ALTER TABLE transactions ADD PRIMARY KEY (id);

-- Data for table: transactions
INSERT INTO transactions (id, user_id, type, amount, currency, status, created_at, payment_method, transaction_details, investment_id, referral_id, payment_proof, external_transaction_id, processed_at, processed_by, admin_notes, receipt_id, receipt_url) VALUES (1, 3, 'deposit', '6.00000000', 'USDT', 'pending', '2025-05-08T22:19:36.162Z', 'paypal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO transactions (id, user_id, type, amount, currency, status, created_at, payment_method, transaction_details, investment_id, referral_id, payment_proof, external_transaction_id, processed_at, processed_by, admin_notes, receipt_id, receipt_url) VALUES (2, 3, 'deposit', '100.00000000', 'USDT', 'pending', '2025-05-08T22:39:26.332Z', 'paypal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

SELECT setval('public.transactions_id_seq', 2, true);

-- Table: users
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id integer DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  wallet_balance numeric DEFAULT '0'::numeric NOT NULL,
  active boolean DEFAULT true NOT NULL,
  role text DEFAULT 'user'::text NOT NULL,
  referral_code text NOT NULL,
  referred_by integer,
  profile_image text,
  country text,
  phone_number text
);

ALTER TABLE users ADD PRIMARY KEY (id);

-- Data for table: users
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (1, 'admin', '$2b$10$8D0qqMQHtE2TLM6rVe8NtedHCZzCBTr.YFVH58oDMuPWipJptdHVa', 'admin@richlance.com', 'Admin', 'User', '0.00000000', true, 'admin', 'ADMIN5MEsnlUA', NULL, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (5, 'mikekivu5', '$2b$10$SAPI4kIGWgkZru6U2I5iy.c1SfXOFBArJR12d484O.3yvJiTbJUwi', 'mikekivu5@gmail.com', 'mike2', 'Kivu', '0.00000000', true, 'user', 'MIKEKIVU5qpw4bq', NULL, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (6, 'makuthum', '$2b$10$dIN0QoSxXbyWxvPJLjJXseI7lZv/XgKGRzbXKvLetsGvj9AcGFFpO', 'mikekivu6@gmail.com', 'makuthu', 'makuthu', '0.00000000', true, 'user', 'MAKUTHUMvwkrzg', NULL, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (7, 'webexpertkenya@gmail.com', '$2b$10$lCQBFEXlvAnkNjcW8TSpeOshshqMsVPjSO8HlMOjYmd3DrJQAOcmS', 'webexpertkenya@gmail.com', 'mutua', 'jj', '0.00000000', true, 'user', 'WEBEXPERTKENYA@GMAIL.COM81ekjw', 3, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (2, 'testuser', '$2b$10$60MHohtrScyPh6q8UHkC4OkE3QbumyxdpYgTFcGB4IcagYHD3tNGO', 'test@example.com', 'Test', 'User', '0.00000000', true, 'user', 'TESTUSERhkjknm', 1, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (4, 'mikekivu3', '$2b$10$DsDNjBwIqrTWLN1.Y5qdVOOrotdVUSdgFN9xWoKEoLwdViqpnCnry', 'mikekivu3@gmail.com', 'mike2', 'Kivu', '0.00000000', true, 'user', 'MIKEKIVU37td72g', 3, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (8, 'webexpertsolutions', '$2b$10$7COgAmTqvv4HrOGbcA/YYuj4SGbq7/RedAkH3A3q5lNozUSaOH9/u', 'info@webexpertsolutions.co.ke', 'brian', 'ndeleva', '0.00000000', true, 'user', 'WEBEXPERTSOLUTIONS5xem1k', NULL, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (9, 'webexpert', '$2b$10$cIkQYcU5CqJFpsun70dXFePNpugkHQEU8tDZ0UQPpsUCJPJryj03C', 'mike@webexpertsolutions.co.ke', 'web ', 'expert', '0.00000000', true, 'user', 'WEBEXPERTxtdyug', 3, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (10, 'mohaabdi', '$2b$10$ng2LTmUBEaq0tDMAO0Tq9.9.8prdl3.MvOqHxtE18LvDJWEvL5FIC', 'mohaabdi555@gmail.com', 'moha', 'abdi', '0.00000000', true, 'user', 'MOHAABDI43gx3d', NULL, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (12, 'musyoka', '$2b$10$.xZwkfo7xDPIYbFQJq7xsu./7docv3G.pbRoPDlUHAbBDPd8x1Uv2', 'musyoka66666@gmail.com', 'musyoka', 'mueke', '0.00000000', true, 'user', 'MUSYOKAnx1ahc', NULL, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (13, 'marie', '$2b$10$XAeX9Wqhl44Wdq78ldkOj.VNsJwImw2ZJVmUFyDL9PisHmfukp8u6', 'marie7868@gmail.com', 'marie', 'Marie', '0.00000000', true, 'user', 'MARIEgy083o', NULL, NULL, 'kenya', '7809786757');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (14, 'jose', '$2b$10$xf2LV6fbRJnqC5tpErbw1e4dq9/8wWAvyJRjgB6RDJS9xQeKu.6rm', 'jose@webexpertsolutions.co.ke', 'jose', 'jose', '0.00000000', true, 'user', 'JOSEhp330r', NULL, NULL, 'kenya', '076565665');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (15, 'mamabo', '$2b$10$3To7P4LC2U4ashvQHQDwZuzlYOXPn9fXztxPKD616Ctyuez0/PEya', 'mambomtinda456342@gmail.com', 'mambo', 'mutinda', '0.00000000', true, 'user', 'MAMABOksvwaw', NULL, NULL, 'kenya', '97642146788');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (16, 'vundi', '$2b$10$vWxrtpjKZuO/bqbjhqmHKuaEkeLIR/IJS54Gmp1gDIPf1s/VW.57e', 'vundi@gmail.com', 'vundi', 'vundi', '0.00000000', true, 'user', 'VUNDIe1hbzj', NULL, NULL, 'kenya', '541678289');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (17, 'wambua', '$2b$10$FfEco8xBUCVeDQOWlAnjIOypw4aloCqGSvJuhUe0DoH.4jQ4mzR06', 'wambua@gmail.com', 'wambua', 'wa', '0.00000000', true, 'user', 'WAMBUAh61oiv', NULL, NULL, 'kenya', '0865438987');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (18, 'musyokawa', '$2b$10$7XAyKJXZJGRscIhWo/2kNuOpo8audgtQ8UmzBxREJe72HBhwUWfLW', 'musyoka@gmail.com', 'musyoka', 'mmm', '0.00000000', true, 'user', 'MUSYOKAWAhjhtr4', NULL, NULL, 'kenya', '1435237717');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (19, 'dkdenniskorir', '$2b$10$AH614FOSpSQJWSff1EUft.PDiuqYtOtbeta6pZ8o45SZWq6B//X/W', 'dkdenniskorir66@gmail.com', 'michael', 'paul', '0.00000000', true, 'user', 'DKDENNISKORIReo4e8u', NULL, NULL, 'Kenya', '0746942707');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (20, 'mutetidavid45632', '$2b$10$n.GxeNX/HxWXSHvFv3L71e9t5SxyLhMO8iXtvMFO.sgd7Ml2rKMCW', 'mutetidavid45632@gmail.com', 'muteti', 'david', '0.00000000', true, 'user', 'MUTETIDAVID4563262t3h8', NULL, NULL, 'kenya', '564785656');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (21, 'makoha', '$2b$10$KxYFMJyJlyVAojBbFBTTBuT8hwX5sK6A./jLBzLSjZDEgn2M/pEvy', 'makohadenis564@gmail.com', 'makaha', 'denis', '0.00000000', true, 'user', 'MAKOHAfncfod', NULL, NULL, 'kenya', '0745536445');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (11, 'mutuadoe@gmail.com', '$2b$10$y623VyfEkfcY3znlcXPUeugMKoby6GyIMcwiPo/WaHlNi2MIBlu0O', 'mutuadoe@gmail.com', 'mutua', 'Doe', '0.00000000', false, 'user', 'MUTUADOE@GMAIL.COMu0gpoz', NULL, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (22, 'peter', '$2b$10$/EqT3ZLOS0UJbMw4CpGZieebb7O4wSwzWyNdoLSYkEarHUOrX8Iby', 'petermkyu@gmail.com', 'peter', 'mk', '0.00000000', true, 'user', 'PETERmovnfn', NULL, NULL, 'kenya', '1234567');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (23, 'tea', '$2b$10$oPC4/DlG4supjcPbx396Q.OJn9xD1ZAz7a3u71EVBBW/VIzvPD58u', 'tea78765@gmail.com', 'tea', 'Kivu', '0.00000000', true, 'user', 'TEAs9w536', NULL, NULL, 'Kenya', '0786544543');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (24, 'mativo', '$2b$10$5DfidvcbnbBRhH25JufdUOGoN5.PCtDdGPy7axxh6pX1ZdU2fBZA.', 'mativo6768@gmail.com', 'mativo', 'mativo', '0.00000000', true, 'user', 'MATIVO0k8x2w', 22, NULL, 'kenya', '07868645776');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (3, 'mikepaul', '$2b$10$RaINHef57rVP0d7bFVqzGOYQ3f/QfcKrtVh7OMRnQAzQZjt4zCHVK', 'mikepaul620@gmail.com', 'Mike', 'Paul', '0.00000000', true, 'member', 'MIKEPAUL1bpilc', 2, NULL, NULL, NULL);
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (25, 'mainamaina', '$2b$10$bwMWV.drHG8LBZkcI6R2Ve/HVTfSKvwpvsN.j8X00ng0ndJx2G7dC', 'mainamaina@gmail.com', 'maina', 'maina', '0.00000000', true, 'user', 'MAINAMAINAenmrb1', 3, NULL, 'Kenya', '7868645776');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (26, 'jacobjacob', '$2b$10$oXErcA59P42QGATrNGn4GeGEEJ7Ywt4xymXfQZ4vCrZQXEJbk.vjm', 'jacobjacob@gmail.com', 'jacob', 'jacob', '0.00000000', true, 'user', 'JACOBJACOBfqhec0', 25, NULL, 'kenya', '5623784878');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (27, 'janetjanet@', '$2b$10$hvfDjL4iFRRWHPNp84C/COg5d7nGhpGz6KspkQbxacP89B3NPJ9l2', 'janetjanet@gmail.com', 'janet', 'janet', '0.00000000', true, 'user', 'JANETJANET@yailwt', 26, NULL, 'kenya', '5675283993');
INSERT INTO users (id, username, password, email, first_name, last_name, wallet_balance, active, role, referral_code, referred_by, profile_image, country, phone_number) VALUES (28, 'webexpertkenya', '$2b$10$zA6jg8.uQ94eKn/v9J1vluZNgCjpLMQMIGezLWIneCjHykva/L2Q6', 'webexperkenya@gmail.com', 'Web', 'Expert', '0.00000000', true, 'admin', 'WEBEXPERTefCiJV', NULL, NULL, NULL, NULL);

SELECT setval('public.users_id_seq', 28, true);

-- Foreign key constraints
ALTER TABLE investments ADD CONSTRAINT investments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE investments ADD CONSTRAINT investments_plan_id_plans_id_fk FOREIGN KEY (plan_id) REFERENCES plans (id);
ALTER TABLE referrals ADD CONSTRAINT referrals_referrer_id_users_id_fk FOREIGN KEY (referrer_id) REFERENCES users (id);
ALTER TABLE referrals ADD CONSTRAINT referrals_referred_id_users_id_fk FOREIGN KEY (referred_id) REFERENCES users (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_investment_id_investments_id_fk FOREIGN KEY (investment_id) REFERENCES investments (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_referral_id_referrals_id_fk FOREIGN KEY (referral_id) REFERENCES referrals (id);
ALTER TABLE users ADD CONSTRAINT users_referred_by_users_id_fk FOREIGN KEY (referred_by) REFERENCES users (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES users (id);
