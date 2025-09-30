import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '../lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const pointSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  description: z.string().optional(),
  latitude: z.coerce.number().min(-90, 'Latitude inválida.').max(90, 'Latitude inválida.'),
  longitude: z.coerce.number().min(-180, 'Longitude inválida.').max(180, 'Longitude inválida.'),
  price_1y: z.coerce.number().min(0).optional(),
  price_2y: z.coerce.number().min(0).optional(),
  price_3y: z.coerce.number().min(0).optional(),
  price_4y: z.coerce.number().min(0).optional(),
  price_5y: z.coerce.number().min(0).optional(),
});

const mapContainerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '0.5rem',
  marginBottom: '1rem',
};

const novaOdessaCenter = {
  lat: -22.78,
  lng: -47.30
};

export function PointForm({ point, onSave, onCancel }) {
  const form = useForm({
    resolver: zodResolver(pointSchema),
    defaultValues: point || {
      name: '',
      description: '',
      latitude: 0,
      longitude: 0,
      price_1y: 0,
      price_2y: 0,
      price_3y: 0,
      price_4y: 0,
      price_5y: 0,
    },
  });

  const [mapCenter, setMapCenter] = useState(novaOdessaCenter);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'point-form-map',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    language: 'pt-BR',
  });

  useEffect(() => {
    if (point && point.latitude && point.longitude) {
      const position = { lat: point.latitude, lng: point.longitude };
      setMarkerPosition(position);
      setMapCenter(position);
    }
  }, [point]);

  const getAddressFromCoordinates = useCallback(async (lat, lng) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=pt-BR`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error('Nenhum resultado encontrado para estas coordenadas.');
    }

    const intersection = data.results.find(r => r.types.includes('intersection'));
    if (intersection) {
      const routes = intersection.address_components.filter(ac => ac.types.includes('route'));
      if (routes.length >= 2) {
        return `${routes[0].long_name} com ${routes[1].long_name}`;
      }
    }
    
    return data.results[0].formatted_address.split(',')[0];
  }, []);

  const handleMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const position = { lat, lng };

    setMarkerPosition(position);
    form.setValue('latitude', parseFloat(lat.toFixed(7)), { shouldValidate: true });
    form.setValue('longitude', parseFloat(lng.toFixed(7)), { shouldValidate: true });
    
    setIsGeocoding(true);
    try {
      const address = await getAddressFromCoordinates(lat, lng);
      form.setValue('name', address, { shouldValidate: true });
    } catch (error) {
      console.error("Geocoding error:", error);
      form.setValue('name', 'Erro ao buscar endereço', { shouldValidate: true });
    } finally {
      setIsGeocoding(false);
    }
  }, [form, getAddressFromCoordinates]);

  const onSubmit = async (values) => {
    try {
      let error;
      if (point) {
        const { error: updateError } = await supabase.from('points').update(values).eq('id', point.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('points').insert(values);
        error = insertError;
      }

      if (error) throw error;
      onSave();
    } catch (error) {
      console.error('Error saving point:', error);
      alert('Não foi possível salvar o ponto. Verifique o console para mais detalhes.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-gray-600 mb-2">
          Clique no mapa para definir a localização. As coordenadas e o nome do ponto serão preenchidos automaticamente.
        </p>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={point ? 18 : 14}
            onClick={handleMapClick}
          >
            {markerPosition && <Marker position={markerPosition} />}
          </GoogleMap>
        ) : (
          <Skeleton className="w-full h-[350px] mb-4" />
        )}
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Nome do Ponto (Ex: Rua A com Rua B)
                {isGeocoding && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              </FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="latitude" render={({ field }) => (<FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="longitude" render={({ field }) => (<FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <h3 className="font-medium">Preços por Período</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="price_1y" render={({ field }) => (<FormItem><FormLabel>1 Ano (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="price_2y" render={({ field }) => (<FormItem><FormLabel>2 Anos (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="price_3y" render={({ field }) => (<FormItem><FormLabel>3 Anos (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="price_4y" render={({ field }) => (<FormItem><FormLabel>4 Anos (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="price_5y" render={({ field }) => (<FormItem><FormLabel>5 Anos (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar Ponto</Button>
        </div>
      </form>
    </Form>
  );
}