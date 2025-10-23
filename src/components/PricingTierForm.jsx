import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

// Define o esquema para um único preço de período
const priceSchema = z.object({
  period_years: z.number().int().positive(),
  price: z.coerce.number().min(0, "O preço não pode ser negativo."),
});

const tierSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  description_template: z.string().optional(),
  // Usamos um array para os preços, que será tratado separadamente
  prices: z.array(priceSchema),
});

const PERIOD_OPTIONS = [
  { years: 1, label: '1 Ano' },
  { years: 2, label: '2 Anos' },
  { years: 3, label: '3 Anos' },
  { years: 4, label: '4 Anos' },
  { years: 5, label: '5 Anos' },
];

export function PricingTierForm({ tier, tierPrices, onSave, onCancel }) {
  const defaultPrices = PERIOD_OPTIONS.map(option => {
    // period_days é years * 365
    const existingPrice = tierPrices?.find(p => p.period_days === option.years * 365);
    return {
      period_years: option.years,
      price: existingPrice ? Number(existingPrice.price) : 0,
    };
  });

  const form = useForm({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      name: tier?.name || '',
      description_template: tier?.description_template || '',
      prices: defaultPrices,
    },
  });

  useEffect(() => {
    if (tier) {
      const prices = PERIOD_OPTIONS.map(option => {
        const existingPrice = tierPrices?.find(p => p.period_days === option.years * 365);
        return {
          period_years: option.years,
          price: existingPrice ? Number(existingPrice.price) : 0,
        };
      });
      
      form.reset({
        name: tier.name || '',
        description_template: tier.description_template || '',
        prices: prices,
      });
    } else {
      form.reset({
        name: '',
        description_template: '',
        prices: PERIOD_OPTIONS.map(option => ({ period_years: option.years, price: 0 })),
      });
    }
  }, [tier, tierPrices, form]);

  const handleSubmit = (values) => {
    // Separa os dados do tier principal dos dados dos preços
    const { prices, ...tierData } = values;
    
    // Formata os preços para a tabela tier_prices
    const pricesToSave = prices.map(p => ({
      period_days: p.period_years * 365,
      period_label: `${p.period_years} Ano(s)`,
      price: p.price,
    }));

    onSave(tierData, pricesToSave);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome do Nível</FormLabel><FormControl><Input placeholder="Ex: Ouro" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
        <h3 className="font-semibold pt-2 border-t">Preços por Período</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PERIOD_OPTIONS.map((option, index) => (
            <FormField key={option.years} control={form.control} name={`prices.${index}.price`} render={({ field }) => (
              <FormItem>
                <FormLabel>Preço {option.label}</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
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
              <code className="mx-1 font-mono bg-muted p-0.5 rounded-sm">{`{{neighborhood}}`}</code>
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