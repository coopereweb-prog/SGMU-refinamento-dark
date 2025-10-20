import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { updateClientProfile } from '../lib/supabase';
import { toast } from 'sonner';

// Schemas de validação condicional
const baseSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('E-mail inválido.'), // Email é apenas para exibição, não editável aqui
  document_type: z.enum(['CPF', 'CNPJ'], {
    required_error: "O tipo de documento é obrigatório."
  }),
  document_number: z.string().min(1, 'O número do documento é obrigatório.'),
  address_street: z.string().min(1, 'A rua é obrigatória.'),
  address_number: z.string().min(1, 'O número é obrigatório.'),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().min(1, 'O bairro é obrigatório.'),
  address_city: z.string().min(1, 'A cidade é obrigatória.'),
  address_state: z.string().min(1, 'O estado é obrigatório.'),
  address_zip_code: z.string().min(8, 'O CEP é obrigatório e deve ter 8 dígitos.').max(9, 'O CEP deve ter no máximo 9 dígitos.'),
  trade_name: z.string().optional(),
  legal_name: z.string().optional(),
  signatory_name: z.string().optional(),
  signatory_cpf: z.string().optional(),
});

const refinedSchema = baseSchema.superRefine((data, ctx) => {
  if (data.document_type === 'CPF') {
    if (!/^\d{11}$/.test(data.document_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF inválido. Deve conter 11 dígitos.',
        path: ['document_number'],
      });
    }
  } else if (data.document_type === 'CNPJ') {
    if (!data.trade_name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O nome fantasia é obrigatório.', path: ['trade_name'] });
    }
    if (!data.legal_name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A razão social é obrigatória.', path: ['legal_name'] });
    }
    if (!/^\d{14}$/.test(data.document_number)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CNPJ inválido. Deve conter 14 dígitos.', path: ['document_number'] });
    }
    if (!data.signatory_name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O nome do signatário é obrigatório.', path: ['signatory_name'] });
    }
    if (!/^\d{11}$/.test(data.signatory_cpf || '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CPF do signatário inválido.', path: ['signatory_cpf'] });
    }
  }
});

export function ClientProfileForm({ profile, onSave }) {
  const form = useForm({
    resolver: zodResolver(refinedSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      document_type: profile?.document_type || 'CPF',
      document_number: profile?.document_number || '',
      trade_name: profile?.trade_name || '',
      legal_name: profile?.legal_name || '',
      address_street: profile?.address_street || '',
      address_number: profile?.address_number || '',
      address_complement: profile?.address_complement || '',
      address_neighborhood: profile?.address_neighborhood || '',
      address_city: profile?.address_city || '',
      address_state: profile?.address_state || '',
      address_zip_code: profile?.address_zip_code || '',
      signatory_name: profile?.signatory_name || '',
      signatory_cpf: profile?.signatory_cpf || '',
    },
  });

  const documentType = form.watch('document_type');

  const onSubmit = async (values) => {
    try {
      await updateClientProfile(profile.id, values);
      toast.success('Perfil atualizado com sucesso!');
      onSave(); // Recarrega o perfil no componente pai
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Não foi possível salvar o perfil.', { description: error.message });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl><Input {...field} disabled /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Documento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CPF">CPF (Pessoa Física)</SelectItem>
                  <SelectItem value="CNPJ">CNPJ (Pessoa Jurídica)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {documentType === 'CPF' ? (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl><Input placeholder="00000000000" {...field} /></FormControl>
                  <FormDescription>Digite apenas números.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="trade_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl><Input placeholder="Nome fantasia da empresa" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl><Input placeholder="Razão social da empresa" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl><Input placeholder="00000000000000" {...field} /></FormControl>
                  <FormDescription>Digite apenas números.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h3 className="font-semibold mt-6 mb-2">Dados do Signatário</h3>
            <FormField
              control={form.control}
              name="signatory_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo do Signatário</FormLabel>
                  <FormControl><Input placeholder="Nome completo de quem assina" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="signatory_cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF do Signatário</FormLabel>
                  <FormControl><Input placeholder="00000000000" {...field} /></FormControl>
                  <FormDescription>Digite apenas números.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <h3 className="font-semibold mt-6 mb-2">Endereço Completo</h3>
        <FormField
          control={form.control}
          name="address_street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rua</FormLabel>
              <FormControl><Input placeholder="Nome da rua" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl><Input placeholder="Número" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address_complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento</FormLabel>
                <FormControl><Input placeholder="Apto, Bloco, etc. (Opcional)" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address_neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl><Input placeholder="Nome do bairro" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl><Input placeholder="Nome da cidade" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address_state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl><Input placeholder="UF" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address_zip_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl><Input placeholder="00000-000" {...field} /></FormControl>
              <FormDescription>Digite apenas números.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Perfil'}
          </Button>
        </div>
      </form>
    </Form>
  );
}