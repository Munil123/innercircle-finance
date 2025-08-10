-- INCOME CATEGORIES
insert into public.categories(circle_id, type, name, subcategories, is_default)
values (null, 'income', 'Salary', ARRAY['Monthly Salary','Bonus','Overtime','Incentives'], true),
       (null, 'income', 'Business', ARRAY['Sales Revenue','Service Revenue','Commission','Consultancy'], true),
       (null, 'income', 'Freelance/Side Hustle', ARRAY['Writing','Design','Tutoring','Delivery/Driving','Other'], true),
       (null, 'income', 'Rental Income', ARRAY['House Rent','Commercial Rent','Equipment Rent'], true),
       (null, 'income', 'Investments Returns', ARRAY['Mutual Fund Redemption','Dividends','Stock Sale','FD Interest','RD Interest','Gold Sale'], true),
       (null, 'income', 'Government Benefits', ARRAY['Subsidies','Pensions','Tax Refund'], true),
       (null, 'income', 'Gifts & Others', ARRAY['Cash Gift','Festival Gift','Miscellaneous'], true);

-- EXPENSE CATEGORIES
insert into public.categories(circle_id, type, name, subcategories, is_default)
values (null, 'expense', 'Food & Groceries', ARRAY['Groceries','Restaurants','Snacks','Tea/Coffee'], true),
       (null, 'expense', 'Utilities', ARRAY['Electricity','Water','Gas','Internet','Phone'], true),
       (null, 'expense', 'Housing', ARRAY['Rent','Maintenance','Repairs'], true),
       (null, 'expense', 'Transportation', ARRAY['Fuel','Public Transport','Cab/Auto','Parking','Vehicle Maintenance'], true),
       (null, 'expense', 'Health', ARRAY['Doctor Visits','Medicines','Health Insurance','Gym'], true),
       (null, 'expense', 'Education', ARRAY['School Fees','College Fees','Coaching','Books'], true),
       (null, 'expense', 'Entertainment', ARRAY['Movies','Outings','Subscriptions (Netflix, Prime)'], true),
       (null, 'expense', 'Shopping', ARRAY['Clothes','Electronics','Home Appliances'], true),
       (null, 'expense', 'Festivals & Gifts', ARRAY['Decorations','Gifts','Feasts'], true),
       (null, 'expense', 'Donations & Charity', ARRAY['NGO Donation','Religious Offerings'], true),
       (null, 'expense', 'Miscellaneous', ARRAY['Unplanned','Emergency','Pet Care'], true);

-- INVESTMENTS CATEGORIES
insert into public.categories(circle_id, type, name, subcategories, is_default)
values (null, 'investments', 'Mutual Funds', ARRAY['Equity','Debt','Hybrid','SIP'], true),
       (null, 'investments', 'Stocks', ARRAY['Delivery','Intraday'], true),
       (null, 'investments', 'Fixed Deposits', ARRAY['Bank FD','Corporate FD'], true),
       (null, 'investments', 'Gold', ARRAY['Physical','Digital'], true),
       (null, 'investments', 'Others', ARRAY['Crypto','Bonds','Real Estate Investment'], true);

-- LENDING/BORROWING CATEGORIES
insert into public.categories(circle_id, type, name, subcategories, is_default)
values (null, 'lending_borrowing', 'Lending', ARRAY['To Friends','To Family','To Colleagues'], true),
       (null, 'lending_borrowing', 'Borrowing', ARRAY['From Friends','From Family','From Colleagues'], true);
