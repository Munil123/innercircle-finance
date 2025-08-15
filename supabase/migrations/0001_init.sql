-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;

-- Enable RLS globally
ALTER DATABASE postgres SET row_security = on;

-- Custom types
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE investment_status AS ENUM ('active', 'sold', 'matured');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE lend_borrow_type AS ENUM ('lend', 'borrow');
CREATE TYPE lend_borrow_status AS ENUM ('active', 'completed', 'defaulted');

-- Circles table
CREATE TABLE public.circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  default_circle_id UUID REFERENCES public.circles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circle members table
CREATE TABLE public.circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role member_role DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  name TEXT NOT NULL,
  subcategories JSONB DEFAULT '[]',
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  type transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments table
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount > 0),
  purchase_date DATE DEFAULT CURRENT_DATE,
  maturity_date DATE,
  expected_return_rate DECIMAL(5,2),
  current_value DECIMAL(12,2),
  status investment_status DEFAULT 'active',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment splits table
CREATE TABLE public.investment_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(investment_id, user_id)
);

-- Lend/Borrow table
CREATE TABLE public.lend_borrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  type lend_borrow_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  interest_rate DECIMAL(5,2) DEFAULT 0,
  borrower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date DATE,
  status lend_borrow_status DEFAULT 'active',
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL,
  parent_type TEXT NOT NULL CHECK (parent_type IN ('investment_split', 'lend_borrow')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  paid_date DATE,
  status payment_status DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth tokens table
CREATE TABLE public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  token_type TEXT DEFAULT 'bearer',
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create indexes for better performance
CREATE INDEX idx_circles_created_by ON public.circles(created_by);
CREATE INDEX idx_user_profiles_referral_code ON public.user_profiles(referral_code);
CREATE INDEX idx_circle_members_circle_id ON public.circle_members(circle_id);
CREATE INDEX idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX idx_categories_circle_id ON public.categories(circle_id);
CREATE INDEX idx_categories_type ON public.categories(type);
CREATE INDEX idx_transactions_circle_id ON public.transactions(circle_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_investments_circle_id ON public.investments(circle_id);
CREATE INDEX idx_investments_status ON public.investments(status);
CREATE INDEX idx_investment_splits_investment_id ON public.investment_splits(investment_id);
CREATE INDEX idx_investment_splits_user_id ON public.investment_splits(user_id);
CREATE INDEX idx_lend_borrow_circle_id ON public.lend_borrow(circle_id);
CREATE INDEX idx_lend_borrow_borrower_id ON public.lend_borrow(borrower_id);
CREATE INDEX idx_lend_borrow_lender_id ON public.lend_borrow(lender_id);
CREATE INDEX idx_lend_borrow_status ON public.lend_borrow(status);
CREATE INDEX idx_payments_parent_id ON public.payments(parent_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_due_date ON public.payments(due_date);
CREATE INDEX idx_reports_circle_id ON public.reports(circle_id);
CREATE INDEX idx_oauth_tokens_user_id ON public.oauth_tokens(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lend_borrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Insert default categories that will be copied to each circle
INSERT INTO public.categories (circle_id, type, name, subcategories, is_default) VALUES
-- Income categories
(NULL, 'income', 'Salary', '["Full-time", "Part-time", "Bonus", "Overtime"]', true),
(NULL, 'income', 'Business', '["Revenue", "Consulting", "Sales", "Services"]', true),
(NULL, 'income', 'Investment', '["Dividends", "Interest", "Capital Gains", "Rental"]', true),
(NULL, 'income', 'Other', '["Gifts", "Refunds", "Insurance", "Miscellaneous"]', true),

-- Expense categories
(NULL, 'expense', 'Food & Dining', '["Groceries", "Restaurants", "Fast Food", "Coffee"]', true),
(NULL, 'expense', 'Transportation', '["Gas", "Public Transit", "Parking", "Car Maintenance"]', true),
(NULL, 'expense', 'Shopping', '["Clothing", "Electronics", "Books", "Hobbies"]', true),
(NULL, 'expense', 'Bills & Utilities', '["Electricity", "Water", "Internet", "Phone"]', true),
(NULL, 'expense', 'Healthcare', '["Medical", "Pharmacy", "Insurance", "Dental"]', true),
(NULL, 'expense', 'Entertainment', '["Movies", "Games", "Subscriptions", "Events"]', true),
(NULL, 'expense', 'Home', '["Rent", "Mortgage", "Repairs", "Furniture"]', true),
(NULL, 'expense', 'Education', '["Tuition", "Books", "Supplies", "Courses"]', true),
(NULL, 'expense', 'Other', '["Gifts", "Donations", "Fees", "Miscellaneous"]', true);

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_circles_updated_at BEFORE UPDATE ON public.circles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lend_borrow_updated_at BEFORE UPDATE ON public.lend_borrow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON public.oauth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
