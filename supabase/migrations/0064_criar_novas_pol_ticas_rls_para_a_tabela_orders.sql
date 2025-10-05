-- Política para usuários autenticados verem seus próprios pedidos
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id OR customer_email = auth.email());

-- Política para administradores verem todos os pedidos
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'operations_manager')
    )
);

-- Política para inserir pedidos (público para criação)
CREATE POLICY "Allow public order creation" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Política para usuários atualizarem seus próprios pedidos
CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id OR customer_email = auth.email());