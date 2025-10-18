import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { compressImage } from '@/lib/image-utils';

const taskSchema = z.object({
  notes: z.string().optional(),
  due_date: z.string().optional(),
});

export function TaskDetailsModal({ task, isOpen, onClose, onUpdate }) {
  const [artFile, setArtFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingArt, setIsDeletingArt] = useState(false);

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      notes: '',
      due_date: '',
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        notes: task.notes || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
      });
    }
    setArtFile(null);
  }, [task, form, isOpen]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArtFile(e.target.files[0]);
    }
  };

  const handleRemoveArtFile = async () => {
    if (!task?.art_file_url) return;

    setIsDeletingArt(true);
    try {
      const filePath = new URL(task.art_file_url).pathname.split('/installation-photos/')[1];
      if (!filePath) throw new Error("URL do arquivo inválida.");

      const { error: storageError } = await supabase.storage.from('installation-photos').remove([filePath]);
      if (storageError) throw storageError;

      const { data, error: dbError } = await supabase
        .from('installation_tasks')
        .update({ art_file_url: null })
        .eq('id', task.id)
        .select()
        .single();
      if (dbError) throw dbError;

      toast.success("Arquivo de arte removido com sucesso.");
      onUpdate(data);
    } catch (error) {
      toast.error("Falha ao remover o arquivo.", { description: error.message });
    } finally {
      setIsDeletingArt(false);
    }
  };

  const handleSave = async (values) => {
    if (!task) return;
    let updatedData = { ...values };

    if (artFile) {
      setIsUploading(true);
      try {
        const compressedFile = await compressImage(artFile, { maxWidth: 1000, quality: 0.85 });
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `art-files/${task.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('installation-photos').upload(fileName, compressedFile);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('installation-photos').getPublicUrl(fileName);
        updatedData.art_file_url = urlData.publicUrl;
      } catch (error) {
        toast.error("Falha no upload do arquivo de arte.", { description: error.message });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    try {
      const { data, error } = await supabase
        .from('installation_tasks')
        .update(updatedData)
        .eq('id', task.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Tarefa atualizada com sucesso!");
      onUpdate(data);
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar alterações.", { description: error.message });
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Tarefa">
      <div className="space-y-4">
        <div className="text-sm">
          <p><strong>Ponto:</strong> {task.point_name}</p>
          <p><strong>Cliente:</strong> {task.customer_name}</p>
          <p><strong>Pedido:</strong> <Button variant="link" asChild className="p-0 h-auto"><Link to={`/admin/orders/${task.order_items.orders.id}`}>#{task.order_items.orders.id.substring(0, 8)}</Link></Button></p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notas</FormLabel><FormControl><Textarea placeholder="Adicione observações sobre a tarefa..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="due_date" render={({ field }) => (
              <FormItem><FormLabel>Data de Entrega</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormItem>
              <FormLabel>Arquivo da Arte</FormLabel>
              <FormControl><Input type="file" onChange={handleFileChange} /></FormControl>
              {task.art_file_url && !artFile && (
                <div className="flex items-center gap-2 mt-2">
                  <a href={task.art_file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">Ver arte atual</a>
                  <Button type="button" variant="destructive" size="icon" className="h-7 w-7" onClick={handleRemoveArtFile} disabled={isDeletingArt}>
                    {isDeletingArt ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </FormItem>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
                {(form.formState.isSubmitting || isUploading) ? <Loader2 className="animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}