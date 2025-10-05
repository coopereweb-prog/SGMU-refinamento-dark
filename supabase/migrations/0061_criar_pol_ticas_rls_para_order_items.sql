-- Política para ver itens dos próprios pedidos
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = order_items.order_id 
        AND (o.user_id = auth.uid() OR o.customer_email = auth.email())
    )
);

-- Política para administradores verem todos os itens
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'operations_manager')
    )
);

-- Política para inserir itens de pedido
CREATE POLICY "Allow order items creation" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);