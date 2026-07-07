import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

export default function WhatsAppFab() {
  return (
    <a
      href={whatsappLink(
        "¡Hola Don Pedro! Quiero información sobre sus harinas y pulpas."
      )}
      target="_blank"
      rel="noopener"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white font-semibold shadow-lg shadow-black/20 pl-4 pr-5 py-3.5 hover:brightness-105 hover:-translate-y-0.5 transition-all"
    >
      <WhatsAppIcon className="w-6 h-6" />
      <span className="hidden sm:inline">Pedir por WhatsApp</span>
    </a>
  );
}
