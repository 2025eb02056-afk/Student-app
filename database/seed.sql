-- Seed Categories (Deterministic valid RFC4122 hex UUIDs)
INSERT INTO categories (id, name) VALUES
('11111111-0000-0000-0000-000000000001', 'Breakfast'),
('11111111-0000-0000-0000-000000000002', 'Lunch'),
('11111111-0000-0000-0000-000000000003', 'Dinner'),
('11111111-0000-0000-0000-000000000004', 'Snacks'),
('11111111-0000-0000-0000-000000000005', 'Fast Food'),
('11111111-0000-0000-0000-000000000006', 'Beverages'),
('11111111-0000-0000-0000-000000000007', 'Desserts'),
('11111111-0000-0000-0000-000000000008', 'South Indian'),
('11111111-0000-0000-0000-000000000009', 'North Indian'),
('11111111-0000-0000-0000-000000000010', 'Chinese'),
('11111111-0000-0000-0000-000000000011', 'Pizza'),
('11111111-0000-0000-0000-000000000012', 'Burgers'),
('11111111-0000-0000-0000-000000000013', 'Biryani'),
('11111111-0000-0000-0000-000000000014', 'Healthy'),
('11111111-0000-0000-0000-000000000015', 'Budget Meals')
ON CONFLICT (id) DO NOTHING;

-- Seed Users (Password: Student123! / Admin123!)
INSERT INTO users (id, full_name, email, phone, password_hash, college_name, role) VALUES
('22222222-0000-0000-0000-000000000001', 'Super Admin', 'admin@campusbites.edu', '9876543210', '$2a$10$w09Zk28c89qX5nLqM9V4iO8e1Q0u4YwS0jNlV2K9G7H3Y5W1Z1R0O', 'Campus Central HQ', 'admin'),
('22222222-0000-0000-0000-000000000002', 'Campus Canteen Manager', 'canteen@campusbites.edu', '9876543211', '$2a$10$w09Zk28c89qX5nLqM9V4iO8e1Q0u4YwS0jNlV2K9G7H3Y5W1Z1R0O', 'University North Campus', 'vendor'),
('22222222-0000-0000-0000-000000000003', 'Arjun Sharma', 'arjun.sharma@campusbites.edu', '9876543212', '$2a$10$w09Zk28c89qX5nLqM9V4iO8e1Q0u4YwS0jNlV2K9G7H3Y5W1Z1R0O', 'Apex Institute of Technology', 'student'),
('22222222-0000-0000-0000-000000000004', 'Priya Patel', 'priya.patel@campusbites.edu', '9876543213', '$2a$10$w09Zk28c89qX5nLqM9V4iO8e1Q0u4YwS0jNlV2K9G7H3Y5W1Z1R0O', 'National College of Engineering', 'student')
ON CONFLICT (id) DO NOTHING;

-- Seed Vendors
INSERT INTO vendors (id, owner_id, name, description, address, phone, image_url, rating, delivery_fee, minimum_order, estimated_delivery_time, is_open) VALUES
('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'Campus Canteen Central', 'The heart of campus dining. Hot thalis, fresh parathas, and daily budget student specials.', 'Student Center Ground Floor, North Block', '9876543220', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80', 4.8, 10.00, 40.00, 15, true),
('33333333-0000-0000-0000-000000000002', NULL, 'Anna South Indian Spot', 'Crispy dosas, steaming soft idlis, and authentic piping hot filter coffee.', 'Gate 3 Food Plaza, University Avenue', '9876543221', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80', 4.7, 15.00, 50.00, 20, true),
('33333333-0000-0000-0000-000000000003', NULL, 'The Dorm Pizza Co.', 'Stone-oven student slices, cheesy garlic sticks, and midnight study combos.', 'Commercial Complex, Stall 12, West Gate', '9876543222', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', 4.6, 20.00, 99.00, 25, true),
('33333333-0000-0000-0000-000000000004', NULL, 'Wok & Roll Chinese Point', 'Fast wok-tossed Hakka noodles, crispy momos, and spicy chili garlic bowls.', 'Hostel Ring Road, Kiosk 5', '9876543223', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80', 4.5, 15.00, 60.00, 20, true),
('33333333-0000-0000-0000-000000000005', NULL, 'Roll Nation & Kebabs', 'Loaded Kolkata kathi rolls, paneer tikka wraps, and crispy egg rolls under ₹99.', 'Near Library Lawn, Gate 2', '9876543224', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', 4.9, 10.00, 50.00, 15, true),
('33333333-0000-0000-0000-000000000006', NULL, 'Chai Shai & Maggi Hub', 'Midnight study fuel, ginger cardamom tea, double-masala maggi, and crispy samosas.', 'Backyard Quad, Hostel 4 Exit', '9876543225', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80', 4.9, 5.00, 30.00, 10, true),
('33333333-0000-0000-0000-000000000007', NULL, 'Green Bowl & Fresh Sips', 'Protein salad bowls, wholesome fruit juices, oats bowls, and grilled sandwiches.', 'Sports Complex Annex', '9876543226', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', 4.7, 15.00, 80.00, 20, true),
('33333333-0000-0000-0000-000000000008', NULL, 'Royal Biryani Pot', 'Aromatic Hyderabadi dum biryani with raita and mirchi ka salan in student portions.', 'Outer Ring Road, Food Mile', '9876543227', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 4.8, 20.00, 110.00, 25, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Menu Items
INSERT INTO menu_items (id, vendor_id, category_id, name, description, price, image_url, is_vegetarian, is_available, preparation_time) VALUES
-- Campus Canteen Central
('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000015', 'Deluxe Student Thali', '2 Butter rotis, paneer sabzi, dal tadka, jeera rice, salad & gulab jamun.', 99.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', true, true, 12),
('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000015', 'Chole Bhature (2 Pcs)', 'Spiced Amritsari chole served with two fluffy golden bhature, pickles & onions.', 75.00, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80', true, true, 10),
('44444444-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Aloo Paratha with Curd', 'Stuffed whole wheat paratha crisped with butter, served with chilled curd & mint chutney.', 45.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', true, true, 8),
('44444444-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000009', 'Paneer Butter Masala Meal', 'Rich creamy paneer butter masala paired with 3 tawa rotis and pickled salad.', 85.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', true, true, 15),
('44444444-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000015', 'Rajma Chawal Combo', 'Homestyle slow-cooked spiced rajma served over fragrant basmati rice.', 60.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', true, true, 8),

-- Anna South Indian Spot
('44444444-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000008', 'Crispy Masala Dosa', 'Golden thin crepe filled with spiced potato masala, served with coconut chutney & sambar.', 55.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', true, true, 10),
('44444444-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000008', 'Steaming Idli Sambar (3 Pcs)', 'Melt-in-mouth steamed rice cakes soaked in flavorful hot lentil sambar.', 40.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', true, true, 5),
('44444444-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000006', 'Madras Filter Coffee', 'Traditional strong decoction brew frothy filter coffee.', 25.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', true, true, 5),
('44444444-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000008', 'Medu Vada (2 Pcs)', 'Crunchy deep-fried lentil fritters with cumin, peppercorns, served with fresh chutney.', 35.00, 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80', true, true, 8),

-- The Dorm Pizza Co.
('44444444-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000011', 'Margherita Personal Pizza (7 Inch)', 'Fresh mozzarella, herbaceous basil, tangy crushed tomato sauce on crispy crust.', 89.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', true, true, 15),
('44444444-0000-0000-0000-000000000011', '33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000011', 'Loaded Veggie Overload (7 Inch)', 'Bell peppers, red onion, golden corn, jalapeños, and melted cheese blend.', 119.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80', true, true, 18),
('44444444-0000-0000-0000-000000000012', '33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000004', 'Cheesy Garlic Breadsticks', 'Golden baked baguette sticks brushed with garlic butter and molten cheddar.', 59.00, 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=600&q=80', true, true, 10),

-- Wok & Roll Chinese Point
('44444444-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000010', 'Veg Hakka Noodles', 'Wok-tossed noodles with shredded cabbage, carrots, bell peppers, soy & vinegar.', 65.00, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80', true, true, 12),
('44444444-0000-0000-0000-000000000014', '33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000010', 'Crispy Veg Momos (6 Pcs)', 'Steamed then wok-crisped dumplings stuffed with seasoned cabbage & scallions.', 50.00, 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80', true, true, 10),
('44444444-0000-0000-0000-000000000015', '33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000010', 'Chili Paneer Gravy Bowl', 'Battered paneer cubes in tangy spicy chili garlic soy sauce over steamed rice.', 95.00, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', true, true, 14),

-- Roll Nation & Kebabs
('44444444-0000-0000-0000-000000000016', '33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000005', 'Paneer Tikka Kathi Roll', 'Charcoal-grilled spiced paneer wrapped in flaky paratha with sliced onions & mint yogurt.', 75.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', true, true, 10),
('44444444-0000-0000-0000-000000000017', '33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000005', 'Double Egg Roll', 'Crisp flaky roll lined with fluffy eggs, crunchy sliced onion, green chilies, and lemon tang.', 50.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', false, true, 8),
('44444444-0000-0000-0000-000000000018', '33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000005', 'Chicken Seekh Roll', 'Succulent spiced chicken seekh kabab wrapped in warm layered flatbread.', 85.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80', false, true, 12),

-- Chai Shai & Maggi Hub
('44444444-0000-0000-0000-000000000019', '33333333-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000004', 'Double Cheese Masala Maggi', 'The student holy grail: 2-minute noodles tossed with spicy veggie masala & melted cheddar.', 45.00, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80', true, true, 7),
('44444444-0000-0000-0000-000000000020', '33333333-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000006', 'Kulhad Adrak Chai (Large)', 'Slow-simmered rich milk tea with fresh crushed ginger and cardamom in earthen clay cup.', 20.00, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80', true, true, 5),
('44444444-0000-0000-0000-000000000021', '33333333-0000-0000-0000-000000000004', 'Crispy Samosa (2 Pcs)', 'Flaky pastry pockets filled with spiced cumin potato and green peas, with tamarind dip.', 30.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', true, true, 5),

-- Royal Biryani Pot
('44444444-0000-0000-0000-000000000022', '33333333-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000013', 'Chicken Dum Biryani (Student Pack)', 'Aromatic long-grain basmati layered with tender spiced chicken, served with raita.', 129.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', false, true, 15),
('44444444-0000-0000-0000-000000000023', '33333333-0000-0000-0000-000000000013', 'Hyderabadi Veg Dum Biryani', 'Slow-cooked fragrant biryani loaded with fresh vegetables, paneer cubes, saffron & mint.', 99.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', true, true, 12),
('44444444-0000-0000-0000-000000000024', '33333333-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000007', 'Gulab Jamun (2 Pcs)', 'Warm melt-in-mouth milk solids soaked in rose cardamom sugar syrup.', 30.00, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80', true, true, 5)
ON CONFLICT (id) DO NOTHING;
