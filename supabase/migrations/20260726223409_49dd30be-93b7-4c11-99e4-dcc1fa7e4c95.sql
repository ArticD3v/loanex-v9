
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public products all" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  emi_plan_months INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public orders all" ON public.orders FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.emis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_phone TEXT NOT NULL,
  principal NUMERIC(10,2) NOT NULL,
  months INT NOT NULL,
  monthly_amount NUMERIC(10,2) NOT NULL,
  paid_months INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  next_due_date DATE NOT NULL DEFAULT (now() + interval '30 days')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emis TO anon, authenticated;
GRANT ALL ON public.emis TO service_role;
ALTER TABLE public.emis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public emis all" ON public.emis FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.products (name, description, price, image_url, category, stock) VALUES
('iPhone 15 Pro', '6.1-inch Super Retina XDR display, A17 Pro chip, titanium design.', 129900, 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'Electronics', 25),
('Samsung Galaxy S24', 'Flagship Android with AI features, 200MP camera.', 79999, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 'Electronics', 40),
('MacBook Air M3', 'Ultra-thin laptop, 13-inch, 8GB RAM, 256GB SSD.', 114900, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'Electronics', 15),
('Sony WH-1000XM5', 'Wireless noise-cancelling over-ear headphones.', 29990, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800', 'Electronics', 60),
('Nike Air Max 90', 'Iconic running sneakers, all-day comfort.', 8999, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 'Fashion', 100),
('Levis 501 Jeans', 'Original fit denim jeans, timeless style.', 3499, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', 'Fashion', 80),
('Ray-Ban Aviator', 'Classic gold-frame aviator sunglasses.', 7999, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', 'Fashion', 50),
('Casio G-Shock', 'Rugged shock-resistant digital watch.', 6499, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'Fashion', 45),
('Dyson V15 Vacuum', 'Cordless stick vacuum with laser detection.', 65900, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800', 'Home', 20),
('Instant Pot Duo', '7-in-1 electric pressure cooker, 6-quart.', 8999, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800', 'Home', 55),
('Philips Air Fryer', 'Healthy oil-free cooking, 4.1L capacity.', 12499, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800', 'Home', 35),
('Nespresso Vertuo', 'Automatic coffee machine with milk frother.', 19990, 'https://images.unsplash.com/photo-1516315720917-231ef9acce48?w=800', 'Home', 30);
