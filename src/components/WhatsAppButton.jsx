import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const whatsappNumber = '5519996850973'; // Seu número de WhatsApp
  const message = 'Olá! Gostaria de mais informações sobre os serviços.'; // Mensagem pré-definida

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappLink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <Button 
        className="rounded-full w-14 h-14 shadow-lg bg-green-500 hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </Button>
    </a>
  );
}