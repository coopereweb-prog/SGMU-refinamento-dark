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
  pricing_tier_id: z.string().uuid("Você deve selecionar um nível de preço."),
  is_available: z.boolean().default(true),
  image_url: z.string().optional(),
  // Novos campos
  street_name: z.string().min(1, { message: "O nome da rua principal é obrigatório." }),
  intersection_name: z.string().optional(),
  _temp_neighborhood: z.string().optional(), // Campo temporário para o bairro
});

export function PointForm({ point, onSave, onCancel }) {
  const [tags, setTags] = useState([]);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [imageFile, setImageFile] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(pointSchema),
    defaultValues: {
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      pricing_tier_id: '',
      is_available: true,
      image_url: '',
      street_name: '',
      intersection_name: '',
      _temp_neighborhood: '',
    },
  });

  // O nome base agora é composto pelas ruas. Deve vir DEPOIS de useForm.
  const baseName = form.watch('street_name') + (form.watch('intersection_name') ? ` c/ ${form.watch('intersection_name')}` : '');

  const selectedTierId = form.watch('pricing_tier_id');
  const currentNeighborhood = form.watch('_temp_neighborhood');

  useEffect(() => {
    if (point) {
      // Garante que os valores numéricos sejam strings para o input type="number"
      form.reset({
        name: point.name || '',
        description: point.description || '',
        latitude: point.latitude ? String(point.latitude) : '',
        longitude: point.longitude ? String(point.longitude) : '',
        pricing_tier_id: point.pricing_tier_id || '',
        is_available: point.is_available ?? true,
        image_url: point.image_url || '',
        street_name: point.street_name || '',
        intersection_name: point.intersection_name || '',
        _temp_neighborhood: point._temp_neighborhood || '',
      });
      
      if (point.id) {
        const fetchPointTags = async () => {
          const { data } = await supabase.from('point_tags').select('tag_id').eq('point_id', point.id);
          setSelectedTags(new Set((data || []).map(pt => pt.tag_id)));
        };
        fetchPointTags();
      } else {
        setSelectedTags(new Set());
      }
    } else {
      // Se o ponto for nulo (novo ponto), reseta para os defaults
      form.reset({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        pricing_tier_id: '',
        is_available: true,
        image_url: '',
        street_name: '',
        intersection_name: '',
        _temp_neighborhood: '',
      });
      setSelectedTags(new Set());
    }
    setImageFile(null); // Limpa o arquivo de imagem ao carregar um novo ponto/edição
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

  // Efeito para atualizar nome e descrição automaticamente
  useEffect(() => {
    const currentBaseName = form.getValues('street_name') + (form.getValues('intersection_name') ? ` c/ ${form.getValues('intersection_name')}` : '');
    const currentNeighborhoodValue = form.getValues('_temp_neighborhood');
    
    if (selectedTierId && pricingTiers.length > 0 && currentBaseName) {
      const selectedTier = pricingTiers.find(t => t.id === selectedTierId);
      if (selectedTier) {
        // Atualiza nome com o novo separador
        const newName = `${selectedTier.name} | ${currentBaseName}`;
        form.setValue('name', newName);

        // Atualiza descrição com todas as variáveis
        let newDescription = selectedTier.description_template || '';
        newDescription = newDescription
          .replace(/{{tier_name}}/g, selectedTier.name)
          .replace(/{{point_name}}/g, currentBaseName)
          .replace(/{{neighborhood}}/g, currentNeighborhoodValue) // Novo campo
          .replace(/{{price_1y}}/g, formatCurrencyBRL(selectedTier.price_1y))
          .replace(/{{price_2y}}/g, formatCurrencyBRL(selectedTier.price_2y))
          .replace(/{{price_3y}}/g, formatCurrencyBRL(selectedTier.price_3y))
          .replace(/{{price_4y}}/g, formatCurrencyBRL(selectedTier.price_4y))
          .replace(/{{price_5y}}/g, formatCurrencyBRL(selectedTier.price_5y));
        form.setValue('description', newDescription);
      }
    } else if (currentBaseName) {
        // Se não houver tier selecionado, apenas define o nome base
        form.setValue('name', currentBaseName);
    }
  }, [selectedTierId, pricingTiers, form.watch('street_name'), form.watch('intersection_name'), currentNeighborhood, form]);


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
        const { data: uploadData, error: uploadError } = await supabase.storage.from('point_images').upload(fileName, compressedFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('point_images').getPublicUrl(uploadData.path);
        imageUrl = publicUrlData.publicUrl;
      } catch (error) {
        toast.error("Falha no upload da imagem.", { description: error.message });
        return;
      }
    }
    
    // Remove o campo temporário antes de salvar no banco
    const { _temp_neighborhood, ...pointDataToSave } = { 
      ...values, 
      image_url: imageUrl,
      // Garante que o nome final seja o composto pelas regras do tier
      name: form.getValues('name'),
      description: form.getValues('description'),
    };
    
    await onSave(pointDataToSave, Array.from(selectedTags));
  };

  // Obter os preços do tier selecionado para exibição
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
            <FormLabel>Classificação do Ponto</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecione a classificação" /></SelectTrigger></FormControl>
              <SelectContent>
                {pricingTiers.map(tier => <SelectItem key={tier.id} value={tier.id}>{tier.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        
        {selectedTier && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-semibold text-blue-700 mb-2">Preços automáticos baseados na classificação:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>1 ano: {formatCurrencyBRL(selectedTier.price_1y)}</div>
              <div>2 anos: {formatCurrencyBRL(selectedTier.price_2y)}</div>
              <div>3 anos: {formatCurrencyBRL(selectedTier.price_3y)}</div>
              <div>4 anos: {formatCurrencyBRL(selectedTier.price_4y)}</div>
              <div>5 anos: {formatCurrencyBRL(selectedTier.price_5y)}</div>
            </div>
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome do Ponto (Automático)</FormLabel><FormControl><Input placeholder="Será preenchido automaticamente" {...field} disabled /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descrição (Automática)</FormLabel><FormControl><Textarea placeholder="Será preenchida automaticamente" {...field} disabled /></FormControl><FormMessage /></FormItem>
        )} />
        
        <h3 className="font-semibold pt-2 border-t">Outras Informações</h3>
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