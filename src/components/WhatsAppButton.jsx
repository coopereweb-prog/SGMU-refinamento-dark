import React from 'react';
import { Button } from '@/components/ui/button';

// Componente SVG com a logomarca oficial do WhatsApp
const WhatsAppIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.926 6.081l-1.224 4.464 4.642-1.225zM12.079 6.809c-.144-.304-.282-.31-.423-.314-.122-.004-.264-.004-.401-.004-.159 0-.411.06-.621.305-.21.24-.813.795-.813 1.936 0 1.141.831 2.246.945 2.403.114.157 1.615 2.555 3.912 3.46.597.231 1.063.368 1.424.474.599.171 1.125.141 1.548.082.467-.064 1.352-.553 1.543-1.08.191-.527.191-.973.133-1.08-.058-.107-.21-.168-.423-.282-.21-.114-1.252-.619-1.446-.688-.195-.069-.336-.107-.477.107-.141.215-.546.689-.671.825-.125.136-.248.157-.423.05-.175-.107-.737-.271-1.404-.867-.521-.464-.872-1.038-.972-1.217-.1-.179-.011-.267.099-.374.104-.103.227-.267.336-.403.114-.136.148-.215.223-.358.075-.142.038-.267-.019-.374-.057-.107-.477-1.141-.652-1.56z"
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