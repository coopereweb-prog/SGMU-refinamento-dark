import { MessageCircle, AlertTriangle } from 'lucide-react';

export const WhatsAppButton = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  
  // O console.log permanece para depuração, mas o feedback visual é mais importante.
  console.log('VITE_WHATSAPP_NUMBER:', whatsappNumber);

  if (!whatsappNumber) {
    // **NOVO:** Em vez de retornar null, mostra um botão de erro.
    // Isto confirma que o componente está a ser renderizado, mas a variável está em falta.
    return (
      <div
        className="fixed bottom-6 right-6 bg-gray-400 text-white p-4 rounded-full shadow-lg flex items-center gap-2 z-[100]"
        title="O número do WhatsApp não está configurado no ficheiro .env"
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
      // **ALTERADO:** z-index aumentado de z-50 para z-[100]
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-[100]"
      aria-label="Contactar no WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
};