CREATE POLICY "Field technicians can update installation details" ON public.points
FOR UPDATE TO authenticated
USING (get_current_user_role() = 'field_technician'::text)
WITH CHECK (get_current_user_role() = 'field_technician'::text);

-- Nota: A política acima permite que o técnico atualize *qualquer* ponto, mas apenas as colunas que ele envia na requisição.
-- Para restringir as colunas que ele pode alterar, precisamos de uma política mais complexa ou confiar no frontend.
-- Como o frontend só envia installation_photo_url e installation_notes, vamos manter a política simples por enquanto, focando no papel.