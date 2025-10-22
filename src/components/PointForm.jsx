import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/image-utils';
import { formatCurrencyBRL } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const pointSchema = z.object({
  name: z.string().min(3, { message: "O nome do ponto deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  latitude: z.coerce.number({ invalid_type_error: "Latitude deve ser um número." }),
  longitude: z.coerce.number({ invalid_type_error: "Longitude deve ser um número." }),
  // Alteração: Tornando o campo opcional e permitindo nulo para teste.
  pricing_tier_id: z.string().uuid("ID do nível de preço inválido.").nullable().optional(),
  is_available: z.boolean().default(true),
  image_url: z.string().optional(),
  street_name: z.string().min(1, { message: "O nome da rua principal é obrigatório." }),
  intersection_name: z.string().optional(),
  _temp_neighborhood: z.string().optional(),
  media_type: z.enum(['static_panel', 'outdoor', 'led_panel']).default('static_panel'),
});

export function PointForm({ point, onSave, onCancel }) {
  const [tags, setTags] = useState([]);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [imageFile, setImageFile] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(pointSchema),
    defaultValues: {
      name: '', description: '', latitude: '', longitude: '',
      pricing_tier_id: null, // Alteração: Valor padrão para nulo
      is_available: true, image_url: '',
      street_name: '', intersection_name: '', _temp_neighborhood: '',
      media_type: 'static_panel',
    },
  });

  const selectedTierId = form.watch('pricing_tier_id');

  useEffect(() => {
    if (point) {
      form.reset({
        ...point,
        latitude: point.latitude || '',
        longitude: point.longitude || '',
        pricing_tier_id: point.pricing_tier_id || null, // Garante nulo em vez de string vazia
        media_type: point.media_type || 'static_panel',
      });
    } else {
      form.reset({
        name: '', description: '', latitude: '', longitude: '',
        pricing_tier_id: null, is_available: true, image_url: '',
        street_name: '', intersection_name: '', _temp_neighborhood: '',
        media_type: 'static_panel',
      });
    }
    
    if (point?.id) {
      supabase.from('point_tags').select('tag_id').eq('point_id', point.id)
        .then(({ data }) => setSelectedTags(new Set((data || []).map(pt => pt.tag_id))));
    } else {
      setSelectedTags(new Set());
    }
    setImageFile(null);
  }, [point, form]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: tagsData } = await supabase.from('tags').select('*');
      setTags(tagsData || []);
      const { data: tiersData } = await supabase.from('pricing_tiers').select('*');
      setPricingTiers(tiersData || []);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const street = form.getValues('street_name');
    const intersection = form.getValues('intersection_name');
    const neighborhood = form.getValues('_temp_neighborhood');
    const baseName = street + (intersection ? ` c/ ${intersection}` : '');
    
    if (selectedTierId && pricingTiers.length > 0 && baseName) {
      const selectedTier = pricingTiers.find(t => t.id === selectedTierId);
      if (selectedTier) {
        form.setValue('name', `${selectedTier.name} | ${baseName}`, { shouldValidate: true });
        let newDescription = (selectedTier.description_template || '')
          .replace(/{{tier_name}}/g, selectedTier.name)
          .replace(/{{point_name}}/g, baseName)
          .replace(/{{neighborhood}}/g, neighborhood || '')
          .replace(/{{price_1y}}/g, formatCurrencyBRL(selectedTier.price_1y))
          .replace(/{{price_2y}}/g, formatCurrencyBRL(selectedTier.price_2y))
          .replace(/{{price_3y}}/g, formatCurrencyBRL(selectedTier.price_3y))
          .replace(/{{price_4y}}/g, formatCurrencyBRL(selectedTier.price_4y))
          .replace(/{{price_5y}}/g, formatCurrencyBRL(selectedTier.price_5y));
        form.setValue('description', newDescription);
      }
    } else if (baseName) {
        form.setValue('name', baseName, { shouldValidate: true });
    }
  }, [selectedTierId, pricingTiers, form.watch('street_name'), form.watch('intersection_name'), form.watch('_temp_neighborhood'), form]);

  const handleTagChange = (tagId) => {
    setSelectedTags(prev => {
      const newSelected = new Set(prev);
      newSelected.has(tagId) ? newSelected.delete(tagId) : newSelected.add(tagId);
      return newSelected;
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values) => {
    let imageUrl = point?.image_url || '';
    if (imageFile) {
      try {
        const compressedFile = await compressImage(imageFile);
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('point_images').upload(fileName, compressedFile);
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from('point_images').getPublicUrl(uploadData.path).data.publicUrl;
      } catch (error) {
        toast.error("Falha no upload da imagem.", { description: error.message });
        return;
      }
    }
    
    const pointDataToSave = {
      name: values.name,
      description: values.description,
      latitude: values.latitude,
      longitude: values.longitude,
      // Alteração: Garante que uma string vazia seja convertida para null antes de salvar.
      pricing_tier_id: values.pricing_tier_id || null,
      is_available: values.is_available,
      street_name: values.street_name,
      intersection_name: values.intersection_name,
      image_url: imageUrl,
      media_type: values.media_type,
    };
    
    await onSave(pointDataToSave, Array.from(selectedTags));
  };

  const selectedTier = pricingTiers.find(t => t.id === selectedTierId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        
        <h3 className="font-semibold pt-2 border-t">Localização e Nomenclatura</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="latitude" render={({ field }) => (
            <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" disabled {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="longitude" render={({ field }) => (
            <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" disabled {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        
        <FormField control={form.control} name="street_name" render={({ field }) => (
          <FormItem><FormLabel>Rua Principal</FormLabel><FormControl><Input placeholder="Ex: Av. Brasil" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="intersection_name" render={({ field }) => (
          <FormItem><FormLabel>Rua do Cruzamento (Opcional)</FormLabel><FormControl><Input placeholder="Ex: Rua 13 de Maio" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <h3 className="font-semibold pt-2 border-t">Classificação e Preços</h3>
        <FormField control={form.control} name="pricing_tier_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Classificação do Ponto (Opcional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecione a classificação (opcional)" /></SelectTrigger></FormControl>
              <SelectContent>
                {pricingTiers.map(tier => <SelectItem key={tier.id} value={tier.id}>{tier.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        
        {selectedTier && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
            <p className="font-semibold text-blue-700 mb-2">Preços automáticos:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>1 ano: {formatCurrencyBRL(selectedTier.price_1y)}</div> <div>2 anos: {formatCurrencyBRL(selectedTier.price_2y)}</div>
              <div>3 anos: {formatCurrencyBRL(selectedTier.price_3y)}</div> <div>4 anos: {formatCurrencyBRL(selectedTier.price_4y)}</div>
              <div>5 anos: {formatCurrencyBRL(selectedTier.price_5y)}</div>
            </div>
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome (Automático)</FormLabel><FormControl><Input disabled {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descrição (Automática)</FormLabel><FormControl><Textarea rows={4} disabled {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
        <h3 className="font-semibold pt-2 border-t">Outras Informações</h3>
        
        <FormField control={form.control} name="media_type" render={({ field }) => (
          <FormItem className="hidden">
            <FormLabel>Tipo de Mídia</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="static_panel">Painel Estático</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="led_panel">Painel de LED</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        
        <div>
          <FormLabel>Tags</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 p-2 border rounded-md">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox id={`tag-${tag.id}`} checked={selectedTags.has(tag.id)} onCheckedChange={() => handleTagChange(tag.id)} />
                <label htmlFor={`tag-${tag.id}`} className="text-sm font-medium leading-none">{tag.name}</label>
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
          {point?.image_url && !imageFile && <img src={point.image_url} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-md" />}
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  );
}