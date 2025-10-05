import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/image-utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const pointSchema = z.object({
  name: z.string().min(3, { message: "O nome do ponto deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  latitude: z.coerce.number({ invalid_type_error: "Latitude deve ser um número." }),
  longitude: z.coerce.number({ invalid_type_error: "Longitude deve ser um número." }),
  price_1y: z.coerce.number().positive().optional().or(z.literal('')),
  price_2y: z.coerce.number().positive().optional().or(z.literal('')),
  price_3y: z.coerce.number().positive().optional().or(z.literal('')),
  price_4y: z.coerce.number().positive().optional().or(z.literal('')),
  price_5y: z.coerce.number().positive().optional().or(z.literal('')),
  is_available: z.boolean().default(true),
  image_url: z.string().optional(),
});

export function PointForm({ point, onSave, onCancel }) {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [imageFile, setImageFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(pointSchema),
    defaultValues: {
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      price_1y: '',
      price_2y: '',
      price_3y: '',
      price_4y: '',
      price_5y: '',
      is_available: true,
      image_url: '',
    },
  });

  useEffect(() => {
    if (point) {
      form.reset({
        name: point.name || '',
        description: point.description || '',
        latitude: point.latitude || '',
        longitude: point.longitude || '',
        price_1y: point.price_1y || '',
        price_2y: point.price_2y || '',
        price_3y: point.price_3y || '',
        price_4y: point.price_4y || '',
        price_5y: point.price_5y || '',
        is_available: point.is_available ?? true,
        image_url: point.image_url || '',
      });

      // Apenas busca as tags se for um ponto existente (com ID)
      if (point.id) {
        const fetchPointTags = async () => {
          const { data, error } = await supabase.from('point_tags').select('tag_id').eq('point_id', point.id);
          if (error) {
            console.error("Error fetching point tags:", error);
            toast.error("Erro ao carregar tags do ponto.");
            setSelectedTags(new Set());
          } else {
            // Garante que 'data' não é nulo antes de mapear
            setSelectedTags(new Set((data || []).map(pt => pt.tag_id)));
          }
        };
        fetchPointTags();
      } else {
        // Se for um ponto novo, reseta as tags selecionadas
        setSelectedTags(new Set());
      }
    } else {
      form.reset();
      setSelectedTags(new Set());
    }
  }, [point, form]);

  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase.from('tags').select('*');
      setTags(data || []);
    };
    fetchTags();
  }, []);

  const handleTagChange = (tagId) => {
    setSelectedTags(prev => {
      const newSelectedTags = new Set(prev);
      newSelectedTags.has(tagId) ? newSelectedTags.delete(tagId) : newSelectedTags.add(tagId);
      return newSelectedTags;
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values) => {
    let imageUrl = values.image_url;

    if (imageFile) {
      try {
        const compressedFile = await compressImage(imageFile);
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('point_images')
          .upload(fileName, compressedFile, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('point_images').getPublicUrl(uploadData.path);
        imageUrl = publicUrlData.publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        form.setError("image_url", { message: "Falha no upload da imagem." });
        return;
      }
    }

    const pointData = { ...values, image_url: imageUrl };
    await onSave(pointData, Array.from(selectedTags));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome do Ponto</FormLabel><FormControl><Input placeholder="Ex: Av. Principal, 123" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Detalhes sobre o ponto" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="latitude" render={({ field }) => (
            <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" placeholder="-22.78" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="longitude" render={({ field }) => (
            <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" placeholder="-47.30" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(year => (
            <FormField key={year} control={form.control} name={`price_${year}y`} render={({ field }) => (
              <FormItem><FormLabel>Preço {year} Ano(s)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ex: 1200.00" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          ))}
        </div>
        <div>
          <FormLabel>Tags</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 p-2 border rounded-md">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox id={`tag-${tag.id}`} checked={selectedTags.has(tag.id)} onCheckedChange={() => handleTagChange(tag.id)} />
                <label htmlFor={`tag-${tag.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{tag.name}</label>
              </div>
            ))}
          </div>
        </div>
        <FormField control={form.control} name="is_available" render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Disponível</FormLabel></FormItem>
        )} />
        <div>
          <FormLabel htmlFor="image">Imagem do Ponto</FormLabel>
          <Input id="image" name="image" type="file" onChange={handleImageChange} className="mt-1" />
          {form.getValues("image_url") && !imageFile && <img src={form.getValues("image_url")} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-md" />}
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  );
}