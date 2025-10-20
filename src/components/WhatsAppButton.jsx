import { AlertTriangle } from 'lucide-react';

export const WhatsAppButton = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  if (!whatsappNumber) {
    return (
      <div
        className="fixed top-1/2 -translate-y-1/2 right-6 bg-gray-400 text-white p-4 rounded-full shadow-lg flex items-center gap-2 z-[100] print:hidden"
        title="O número do WhatsApp não está configurado. Verifique o ficheiro .env.local e reinicie o servidor."
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
      className="fixed top-1/2 -translate-y-1/2 right-6 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-transform hover:scale-110 z-[100] ring-2 ring-white/20 hover:ring-white/40 print:hidden"
      aria-label="Contactar no WhatsApp"
    >
      <img 
        src="/whatsapp-logo.png" 
        alt="WhatsApp" 
        className="w-8 h-8" 
      />
    </a>
  );
}