import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const tierSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  price_1y: z.coerce.number().positive("O preço deve ser positivo."),
  price_2y: z.coerce.number().positive("O preço deve ser positivo."),
  price_3y: z.coerce.number().positive("O preço deve ser positivo."),
  price_4y: z.coerce.number().positive("O preço deve ser positivo."),
  price_5y: z.coerce.number().positive("O preço deve ser positivo."),
  description_template: z.string().optional(),
});

export function PricingTierForm({ tier, onSave, onCancel }) {
  const form = useForm({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      name: '',
      price_1y: 0, // Alterado para 0
      price_2y: 0, // Alterado para 0
      price_3y: 0, // Alterado para 0
      price_4y: 0, // Alterado para 0
      price_5y: 0, // Alterado para 0
      description_template: '',
    },
  });

  useEffect(() => {
    if (tier) {
      // Garante que os números sejam tratados corretamente ao carregar
      form.reset({
        name: tier.name || '',
        price_1y: Number(tier.price_1y) || 0,
        price_2y: Number(tier.price_2y) || 0,
        price_3y: Number(tier.price_3y) || 0,
        price_4y: Number(tier.price_4y) || 0,
        price_5y: Number(tier.price_5y) || 0,
        description_template: tier.description_template || '',
      });
    } else {
      form.reset({
        name: '', price_1y: 0, price_2y: 0, price_3y: 0, price_4y: 0, price_5y: 0, description_template: ''
      });
    }
  }, [tier, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome do Nível</FormLabel><FormControl><Input placeholder="Ex: Ouro" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(year => (
            <FormField key={year} control={form.control} name={`price_${year}y`} render={({ field }) => (
              <FormItem><FormLabel>Preço {year} Ano(s)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          ))}
        </div>
        <FormField control={form.control} name="description_template" render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo de Descrição</FormLabel>
            <FormControl><Textarea placeholder="Use as variáveis abaixo para criar um texto dinâmico." {...field} /></FormControl>
            <FormDescription className="text-xs">
              Variáveis: 
              <code className="mx-1 font-mono bg-muted p-0.5 rounded-sm">{`{{tier_name}}`}</code>
              <code className="mx-1 font-mono bg-muted p-0.5 rounded-sm">{`{{point_name}}`}</code>
              <code className="mx-1 font-mono bg-muted p-0.5 rounded-sm">{`{{price_1y}}`}</code>
              ...
              <code className="mx-1 font-mono bg-muted p-0.5 rounded-sm">{`{{price_5y}}`}</code>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  );
}