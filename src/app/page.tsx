import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Beneficios from "@/components/Beneficios";
import Productos from "@/components/Productos";
import Origen from "@/components/Origen";
import Proceso from "@/components/Proceso";
import Pulpas from "@/components/Pulpas";
import ComoPedir from "@/components/ComoPedir";
import Contacto from "@/components/Contacto";
import Legal from "@/components/Legal";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import PresentacionModal from "@/components/PresentacionModal";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Beneficios />
        <Productos />
        <Origen />
        <Proceso />
        <Pulpas />
        <ComoPedir />
        <Contacto />
        <Legal />
      </main>
      <Footer />
      <WhatsAppFab />
      <PresentacionModal />
    </>
  );
}
