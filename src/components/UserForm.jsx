import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const userSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  role: z.enum(['admin', 'operations_manager', 'field_technician', 'client']),
  full_name: z.string().min(2, { message: "O nome completo é obrigatório." }),
  phone: z.string().optional(),
});

export function UserForm({ user, onSave, onCancel, isInvite = false }) {
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      role: 'client',
      full_name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || '',
        role: user.app_metadata?.role || 'client',
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
      });
    } else {
      form.reset({ email: '', role: 'client', full_name: '', phone: '' });
    }
  }, [user, form]);

  const onSubmit = async (values) => {
    await onSave(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  {...field}
                  disabled={!isInvite && !!user}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl><Input placeholder="Nome do usuário" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isInvite && (
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operations_manager">Gerente de Operações</SelectItem>
                  <SelectItem value="field_technician">Técnico de Campo</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : (isInvite ? 'Convidar' : 'Salvar')}
          </Button>
        </div>
      </form>
    </Form>
  );
}