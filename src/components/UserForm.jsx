import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function UserForm({ user, onSave, onCancel, isInvite = false }) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'client',
    full_name: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        role: user.app_metadata?.role || 'client',
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
        disabled={!isInvite && user} // Disable email editing for existing users
      />
      {!isInvite && (
        <>
          <Input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Nome Completo"
          />
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Telefone"
          />
        </>
      )}
      <Select value={formData.role} onValueChange={handleRoleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o papel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="operations_manager">Gerente de Operações</SelectItem>
          <SelectItem value="field_technician">Técnico de Campo</SelectItem>
          <SelectItem value="client">Cliente</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isInvite ? 'Enviando convite...' : 'Salvando...') : (isInvite ? 'Convidar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
}