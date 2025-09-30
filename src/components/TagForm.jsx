import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createTag, updateTag } from '../lib/supabase';

const tagSchema = z.object({
  name: z.string().min(2, 'O nome da tag deve ter pelo menos 2 caracteres.'),
});

export function TagForm({ tag, onSave, onCancel }) {
  const form = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: tag || { name: '' },
  });

  const onSubmit = async (values) => {
    try {
      if (tag) {
        await updateTag(tag.id, values.name);
      } else {
        await createTag(values.name);
      }
      onSave();
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Não foi possível salvar a tag.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Tag</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Próximo a Escola" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Tag'}
          </Button>
        </div>
      </form>
    </Form>
  );
}