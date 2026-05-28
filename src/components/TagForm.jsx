import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const tagSchema = z.object({
  name: z.string().min(2, { message: "O nome da tag deve ter pelo menos 2 caracteres." }),
});

export function TagForm({ tag, onSave, onCancel }) {
  const form = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name || '',
    },
  });

  useEffect(() => {
    form.reset({ name: tag?.name || '' });
  }, [tag, form]);

  const onSubmit = async (values) => {
    await onSave(values);
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
                <Input placeholder="Ex: Alta Visibilidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}