import { AlertTriangle } from 'lucide-react';

export const WhatsAppButton = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  if (!whatsappNumber) {
    // Mantém o estado de erro visual para ajudar a diagnosticar problemas de .env
    return (
      <div
        className="fixed bottom-6 right-6 bg-gray-400 text-white p-4 rounded-full shadow-lg flex items-center gap-2 z-[100]"
        title="O número do WhatsApp não está configurado. Verifique o ficheiro .env e reinicie o servidor."
      >
        <AlertTriangle size={28} />
        <span className="text-sm hidden sm:inline">Número não configurado</span>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-[100]"
      aria-label="Contactar no WhatsApp"
    >
      {/* **ALTERADO:** Substituído o ícone por uma tag de imagem para usar o seu logótipo */}
      <img 
        src="/whatsapp-logo.png" 
        alt="WhatsApp" 
        className="w-8 h-8" 
      />
    </a>
  );
};