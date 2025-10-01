// A importação do AlertTriangle não é mais necessária para este teste
// import { AlertTriangle } from 'lucide-react';

export const WhatsAppButton = () => {
  // **TESTE:** A leitura da variável de ambiente foi temporariamente removida.
  // const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  // **TESTE:** O seu número foi colocado diretamente no código.
  const whatsappNumber = '5519996850973';

  // O bloco de erro 'if' foi removido, pois o número agora está garantido.
  // if (!whatsappNumber) { ... }

  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-[100]"
      aria-label="Contactar no WhatsApp"
    >
      <img 
        src="/whatsapp-logo.png" 
        alt="WhatsApp" 
        className="w-8 h-8" 
      />
    </a>
  );
};