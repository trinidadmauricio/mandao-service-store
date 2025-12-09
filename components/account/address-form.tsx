/**
 * Address Form Component
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService, type CreateAddressDto } from '@/lib/api/services/address.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const addressSchema = z.object({
  label: z.string().min(1, 'La etiqueta es requerida'),
  recipient_name: z.string().min(1, 'El nombre del destinatario es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  street: z.string().min(1, 'La calle es requerida'),
  street_line_2: z.string().optional(),
  city: z.string().min(1, 'La ciudad es requerida'),
  state: z.string().min(1, 'El estado es requerido'),
  zip_code: z.string().min(1, 'El código postal es requerido'),
  country: z.string().min(1, 'El país es requerido'),
  instructions: z.string().optional(),
  is_default: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  addressId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ addressId, onSuccess, onCancel }: AddressFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: address } = useQuery({
    queryKey: ['customer-address', addressId],
    queryFn: () => addressService.getAddress(addressId!),
    enabled: !!addressId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'El Salvador',
      is_default: false,
    },
    values: address
      ? {
          label: address.label,
          recipient_name: address.recipient_name,
          phone: address.phone,
          street: address.street,
          street_line_2: address.street_line_2 || '',
          city: address.city,
          state: address.state,
          zip_code: address.zip_code,
          country: address.country,
          instructions: address.instructions || '',
          is_default: address.is_default,
        }
      : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAddressDto) => addressService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateAddressDto>) =>
      addressService.updateAddress(addressId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer-address', addressId] });
      onSuccess();
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      if (addressId) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="label">Etiqueta *</Label>
          <Input
            id="label"
            placeholder="Casa, Oficina, etc."
            {...register('label')}
            disabled={isSubmitting}
          />
          {errors.label && (
            <p className="text-sm text-destructive">{errors.label.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient_name">Nombre del Destinatario *</Label>
          <Input
            id="recipient_name"
            {...register('recipient_name')}
            disabled={isSubmitting}
          />
          {errors.recipient_name && (
            <p className="text-sm text-destructive">{errors.recipient_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+503 1234 5678"
          {...register('phone')}
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Calle y número *</Label>
        <Input
          id="street"
          {...register('street')}
          disabled={isSubmitting}
        />
        {errors.street && (
          <p className="text-sm text-destructive">{errors.street.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="street_line_2">Calle línea 2 (opcional)</Label>
        <Input
          id="street_line_2"
          {...register('street_line_2')}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad *</Label>
          <Input
            id="city"
            {...register('city')}
            disabled={isSubmitting}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado/Provincia *</Label>
          <Input
            id="state"
            {...register('state')}
            disabled={isSubmitting}
          />
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code">Código Postal *</Label>
          <Input
            id="zip_code"
            {...register('zip_code')}
            disabled={isSubmitting}
          />
          {errors.zip_code && (
            <p className="text-sm text-destructive">{errors.zip_code.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">País *</Label>
        <Input
          id="country"
          {...register('country')}
          disabled={isSubmitting}
        />
        {errors.country && (
          <p className="text-sm text-destructive">{errors.country.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instrucciones de entrega (opcional)</Label>
        <Textarea
          id="instructions"
          rows={3}
          placeholder="Ej: Dejar en la puerta, timbre dos veces, etc."
          {...register('instructions')}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_default"
          checked={watch('is_default')}
          onCheckedChange={(checked) => setValue('is_default', checked === true)}
          disabled={isSubmitting}
        />
        <Label htmlFor="is_default" className="text-sm font-normal cursor-pointer">
          Establecer como dirección predeterminada
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Dirección'
          )}
        </Button>
      </div>
    </form>
  );
}

