import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/image-utils';

export function PointForm({ point, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_1y: '',
    price_2y: '',
    price_3y: '',
    price_4y: '',
    price_5y: '',
    is_available: true,
    image_url: '',
  });
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (point) {
      setFormData({
        name: point.name || '',
        description: point.description || '',
        price_1y: point.price_1y || '',
        price_2y: point.price_2y || '',
        price_3y: point.price_3y || '',
        price_4y: point.price_4y || '',
        price_5y: point.price_5y || '',
        is_available: point.is_available,
        image_url: point.image_url || '',
      });
      // Carregar tags associadas ao ponto
      const fetchPointTags = async () => {
        const { data } = await supabase
          .from('point_tags')
          .select('tag_id')
          .eq('point_id', point.id);
        setSelectedTags(new Set(data.map(pt => pt.tag_id)));
      };
      fetchPointTags();
    }
  }, [point]);

  useEffect(() => {
    // Carregar todas as tags disponíveis
    const fetchTags = async () => {
      const { data } = await supabase.from('tags').select('*');
      setTags(data || []);
    };
    fetchTags();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTagChange = (tagId) => {
    setSelectedTags(prev => {
      const newSelectedTags = new Set(prev);
      if (newSelectedTags.has(tagId)) {
        newSelectedTags.delete(tagId);
      } else {
        newSelectedTags.add(tagId);
      }
      return newSelectedTags;
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let imageUrl = formData.image_url;

    if (imageFile) {
      try {
        const compressedFile = await compressImage(imageFile);
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('point_images')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('point_images')
          .getPublicUrl(uploadData.path);
        
        imageUrl = publicUrlData.publicUrl;

      } catch (error) {
        console.error('Error uploading image:', error);
        setIsSubmitting(false);
        return;
      }
    }

    const pointData = {
      ...formData,
      image_url: imageUrl,
      price_1y: formData.price_1y ? parseFloat(formData.price_1y) : null,
      price_2y: formData.price_2y ? parseFloat(formData.price_2y) : null,
      price_3y: formData.price_3y ? parseFloat(formData.price_3y) : null,
      price_4y: formData.price_4y ? parseFloat(formData.price_4y) : null,
      price_5y: formData.price_5y ? parseFloat(formData.price_5y) : null,
    };

    await onSave(pointData, Array.from(selectedTags));
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" value={formData.name} onChange={handleChange} placeholder="Nome do Ponto" required />
      <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descrição" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Input name="price_1y" type="number" value={formData.price_1y} onChange={handleChange} placeholder="Preço 1 Ano" />
        <Input name="price_2y" type="number" value={formData.price_2y} onChange={handleChange} placeholder="Preço 2 Anos" />
        <Input name="price_3y" type="number" value={formData.price_3y} onChange={handleChange} placeholder="Preço 3 Anos" />
        <Input name="price_4y" type="number" value={formData.price_4y} onChange={handleChange} placeholder="Preço 4 Anos" />
        <Input name="price_5y" type="number" value={formData.price_5y} onChange={handleChange} placeholder="Preço 5 Anos" />
      </div>
      <div>
        <label className="text-sm font-medium">Tags</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag.id}`}
                checked={selectedTags.has(tag.id)}
                onCheckedChange={() => handleTagChange(tag.id)}
              />
              <label htmlFor={`tag-${tag.id}`} className="text-sm">{tag.name}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="is_available" name="is_available" checked={formData.is_available} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))} />
        <label htmlFor="is_available">Disponível</label>
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Imagem do Ponto</label>
        <Input id="image" name="image" type="file" onChange={handleImageChange} className="mt-1" />
        {formData.image_url && !imageFile && <img src={formData.image_url} alt="Preview" className="mt-2 h-20 w-20 object-cover" />}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}