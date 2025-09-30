import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteUser, updateUserRole } from '../lib/supabase';
import { toast } from 'sonner';

const userSchema = z.object({
  name: z.string().min(2, 'O nome é obrigatório.'),
  email: z.string().email('E-mail inválido.'),
  role: z.enum(['admin', 'operations_manager', 'field_technician'], {
    required_error: "A função é obrigatória."
  }),
});

export function UserForm({ user, onSave, onCancel }) {
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: user || { name: '', email: '', role: 'field_technician' },
  });

  const isEditing = !!user;

  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        await updateUserRole(user.id, values.role);
        toast.success('Função do usuário atualizada com sucesso!');
      } else {
        await inviteUser(values.email, values.name, values.role);
        toast.success('Convite enviado com sucesso!', {
          description: `Um e-mail foi enviado para ${values.email} para completar o cadastro.`,
        });
      }
      onSave();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Ocorreu um erro', { description: error.message });
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
              <FormLabel>Nome Completo</FormLabel>
              <FormControl><Input placeholder="Nome do usuário" {...field} disabled={isEditing} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl><Input type="email" placeholder="email@exemplo.com" {...field} disabled={isEditing} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operations_manager">Gerente de Operações</SelectItem>
                  <SelectItem value="field_technician">Técnico de Campo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}