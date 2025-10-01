import React from 'react';
import { Button } from '@/components/ui/button';

// Componente SVG para o ícone do WhatsApp
const WhatsAppIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.52 16c-.22.12-.82.41-1.43.15-.56-.23-1.07-.86-1.5-1.29-.43-.43-1.05-.9-1.05-1.56s.23-.99.46-1.21c.23-.23.5-.28.69-.28h.28c.18 0 .38-.05.52.12.14.17.52.86.57 1.02.05.17.05.28 0 .43-.05.14-.23.28-.46.52-.23.23-.41.28-.57.43-.17.14-.35.33-.11.7.23.35.99 1.56 2.1 2.52.94.81 1.73 1.07 2.01 1.21.28.14.46.12.64-.05.17-.17.74-.86.94-1.12.2-.28.41-.23.64-.12.23.12 1.43.69 1.67.81.23.12.38.17.43.28.05.12.05.69-.17 1.32-.23.64-1.43 1.29-1.73 1.32-.28.05-1.02.12-1.88-.23z"
    />
  </svg>
);

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
        <WhatsAppIcon className="h-7 w-7 text-white" />
      </Button>
    </a>
  );
}