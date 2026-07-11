// Datos centrales de la empresa Harinas y Pulpas Don Pedro.
// Fuente: material y documentos legales entregados por la empresa (Mérida, Venezuela).

export const SITE_URL = "https://harinadonpedro.com";

export const empresa = {
  nombre: "Harinas y Pulpas Don Pedro",
  nombreCorto: "Don Pedro",
  eslogan: "Tradición y Sabor",
  desde: "1915",
  descripcionCorta:
    "Harinas y pulpas artesanales 100% naturales, libres de gluten y sin conservantes, elaboradas en Mérida, Venezuela.",
  razonSocial: "Emprendimiento Glenis Molina",
  propietaria: "Glenis Molina Pernía",
  rif: "J-50656833-0",
  registroSanitario: "MER-TIPO 1-000753394",
  ciudad: "Ejido",
  municipio: "Municipio Campo Elías",
  estado: "Estado Mérida",
  pais: "Venezuela",
  zonaPostal: "5111",
  direccion:
    "Calle Las Frutas, Casa Nro. 2, Sector El Manzano Bajo, Ejido, Municipio Campo Elías, Estado Mérida, Venezuela.",
  parroquia: "Parroquia Montalbán",
};

// El número principal se usa para WhatsApp y como contacto destacado.
export const contacto = {
  // Formato internacional para enlaces tel: y WhatsApp.
  whatsapp: "584143759603",
  telefonos: [
    { display: "0414-375.96.03", tel: "+584143759603" },
    { display: "0412-375.96.03", tel: "+584123759603" },
    { display: "0424-737.99.82", tel: "+584247379982" },
  ],
  correo: "jmmcoromoto2020@gmail.com",
  instagram: "donpedro.vnlz",
  instagramUrl: "https://instagram.com/donpedro.vnlz",
};

export type Producto = {
  slug: string;
  nombre: string;
  linea?: string;
  origen: string;
  imagen: string;
  imagenAlt: string;
  presentacion: string;
  descripcion: string;
  usos: string[];
  destacado?: boolean;
};

export const harinas: Producto[] = [
  {
    slug: "harina-de-platano",
    nombre: "Harina de Plátano",
    origen: "Plátano verde",
    imagen: "/images/productos/harina-platano-don-pedro-bolsa-500g.jpg",
    imagenAlt:
      "Bolsa de Harina de Plátano Don Pedro de 500 gramos, producto artesanal de Mérida",
    presentacion: "500 g · Bolsa resellable",
    descripcion:
      "Harina de plátano verde deshidratado y molido de forma artesanal. Multiusos, ideal para hornear, espesar y preparaciones libres de gluten.",
    usos: ["Panes y tortas", "Espesar sopas y cremas", "Coladas y compotas", "Repostería sin gluten"],
    destacado: true,
  },
  {
    slug: "harina-de-yuca",
    nombre: "Harina de Yuca",
    origen: "Yuca (mandioca)",
    imagen: "/images/productos/harina-yuca-don-pedro-bolsa-500g.jpg",
    imagenAlt:
      "Bolsa de Harina de Yuca Don Pedro de 500 gramos, artesanal y libre de gluten",
    presentacion: "500 g · Bolsa resellable",
    descripcion:
      "Harina de yuca natural, suave y versátil. Perfecta para panadería, arepas, buñuelos y recetas tradicionales sin gluten.",
    usos: ["Panadería y arepas", "Buñuelos y almojábanas", "Espesante natural", "Recetas sin gluten"],
    destacado: true,
  },
  {
    slug: "nutriban-harina-de-cambur",
    nombre: "Nutriban · Harina de Cambur",
    linea: "Nutriban",
    origen: "Cambur (banano)",
    imagen: "/images/productos/nutriban-harina-cambur-nutribam-bebida-instantanea.jpg",
    imagenAlt:
      "Nutriban Harina de Cambur Don Pedro 500 g junto a Nutribam bebida instantánea de cambur",
    presentacion: "500 g · Bolsa resellable",
    descripcion:
      "Nuestra línea Nutriban: harina de cambur 100% natural, nutritiva y libre de gluten. Aporta energía y un sabor suave a tus preparaciones.",
    usos: ["Coladas y bebidas", "Compotas para bebés", "Repostería nutritiva", "Batidos energéticos"],
    destacado: true,
  },
  {
    slug: "nutribam-bebida-de-cambur",
    nombre: "Nutribam · Bebida instantánea de Cambur",
    linea: "Nutriban",
    origen: "Cambur (banano)",
    imagen: "/images/productos/nutriban-harina-cambur-nutribam-bebida-instantanea.jpg",
    imagenAlt: "Nutribam bebida instantánea de cambur Don Pedro presentación de 250 gramos",
    presentacion: "250 g · Bolsa",
    descripcion:
      "Bebida instantánea de cambur: solo agrega agua o leche y disfruta. Natural, nutritiva y práctica para toda la familia.",
    usos: ["Desayunos rápidos", "Merienda energética", "Bebida caliente o fría"],
  },
];

export type Pulpa = {
  nombre: string;
  emoji: string;
};

export const pulpas: Pulpa[] = [
  { nombre: "Tomate de Árbol", emoji: "🍅" },
  { nombre: "Mora", emoji: "🫐" },
  { nombre: "Fresa", emoji: "🍓" },
  { nombre: "Mango", emoji: "🥭" },
  { nombre: "Piña", emoji: "🍍" },
  { nombre: "Patilla", emoji: "🍉" },
];

export const galeriaPulpas = [
  {
    src: "/images/pulpas/surtido-pulpas-fruta-don-pedro-merida.jpg",
    alt: "Surtido de pulpas de fruta natural Don Pedro: piña, patilla, fresa, mora, tomate de árbol y mango",
  },
  {
    src: "/images/pulpas/pulpas-fruta-natural-don-pedro-variedades.jpg",
    alt: "Variedades de pulpas de fruta artesanales Don Pedro sin conservantes",
  },
  {
    src: "/images/pulpas/pulpas-fruta-don-pedro-tomate-arbol-mora-mango.jpg",
    alt: "Pulpas Don Pedro de tomate de árbol, mora y mango de 500 gramos",
  },
];

export const origenes = [
  {
    titulo: "Del plátano",
    emoji: "🍌",
    texto:
      "El plátano verde se cosecha en su punto, se pela, se deshidrata y se muele. Así nace una harina multiusos, rica en almidón resistente.",
    imagen: "/images/productos/harina-platano-don-pedro-500g-producto.jpg",
    alt: "Origen de la harina de plátano Don Pedro",
  },
  {
    titulo: "De la yuca",
    emoji: "🌿",
    texto:
      "La yuca (mandioca) se selecciona fresca, se procesa y se seca cuidadosamente hasta obtener una harina fina, suave y versátil.",
    imagen: "/images/productos/harina-yuca-don-pedro-bolsa-500g.jpg",
    alt: "Origen de la harina de yuca Don Pedro",
  },
  {
    titulo: "Del cambur",
    emoji: "🍌",
    texto:
      "El cambur maduro se convierte en nuestra línea Nutriban: una harina nutritiva y energética, ideal para grandes y chicos.",
    imagen: "/images/productos/nutriban-harina-cambur-nutribam-bebida-instantanea.jpg",
    alt: "Origen de la harina de cambur Nutriban Don Pedro",
  },
];

export const beneficios = [
  {
    emoji: "🌾",
    titulo: "100% Natural",
    texto: "Solo la fruta o el tubérculo. Sin químicos, sin colorantes, sin aditivos.",
  },
  {
    emoji: "🚫",
    titulo: "Libre de Gluten",
    texto: "Aptas para personas celíacas y para quienes buscan una alimentación más sana.",
  },
  {
    emoji: "🍃",
    titulo: "Sin Conservantes",
    texto: "Nuestras pulpas y harinas conservan su sabor y nutrientes de forma natural.",
  },
  {
    emoji: "👐",
    titulo: "Artesanal",
    texto: "Elaboradas a mano, en pequeños lotes, cuidando cada detalle y su calidad.",
  },
  {
    emoji: "⚡",
    titulo: "Nutritivas",
    texto: "Fuente de energía, fibra y minerales para toda la familia.",
  },
  {
    emoji: "🇻🇪",
    titulo: "Hecho en Mérida",
    texto: "Producto venezolano con más de un siglo de tradición y sabor.",
  },
];

export const galeriaProceso = [
  {
    src: "/images/produccion/produccion-artesanal-harina-don-pedro-merida.jpg",
    alt: "Elaboración artesanal de harina Don Pedro con normas de higiene en Mérida",
  },
  {
    src: "/images/produccion/produccion-harina-artesanal-don-pedro-taller-merida.jpg",
    alt: "Envasado artesanal de harina en el taller Don Pedro de Mérida",
  },
  {
    src: "/images/produccion/elaboracion-harina-natural-don-pedro-merida.jpg",
    alt: "Productor elaborando harina natural Don Pedro",
  },
  {
    src: "/images/produccion/proceso-produccion-harina-don-pedro-merida.jpg",
    alt: "Proceso de producción de harina artesanal Don Pedro",
  },
];

export const documentosLegales = [
  {
    titulo: "Permiso Sanitario de Funcionamiento",
    emisor: "Contraloría Sanitaria de Mérida (SACS)",
    detalle: "PSN° MER-TIPO I-000753394 · Emitido el 28/02/2025",
    imagen: "/images/legal/permiso-sanitario-sacs-merida-don-pedro.jpg",
    alt: "Permiso Sanitario de Funcionamiento SACS Mérida de Harinas Don Pedro",
  },
  {
    titulo: "Registro Único de Información Fiscal (RIF)",
    emisor: "SENIAT · Región Los Andes",
    detalle: "RIF J-50656833-0 · Contribuyente Ordinario del IVA",
    imagen: "/images/legal/rif-seniat-emprendimiento-glenis-molina.jpg",
    alt: "RIF SENIAT del Emprendimiento Glenis Molina, Harinas Don Pedro",
  },
];

export const catalogoPdf = "/docs/catalogo-harinas-don-pedro.pdf";

export function whatsappLink(mensaje: string) {
  return `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
