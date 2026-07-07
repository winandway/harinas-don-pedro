# Harinas y Pulpas Don Pedro

Sitio web escaparate (showcase) de **Harinas y Pulpas Don Pedro**, emprendimiento
artesanal de Ejido, Estado Mérida, Venezuela. Harinas de plátano, yuca y cambur
(línea *Nutriban*) y pulpas de fruta 100% naturales, libres de gluten y sin
conservantes. Tradición y sabor desde 1915.

## Características

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4) — exportación estática.
- **Catálogo PDF** descargable, diseñado con la identidad de marca.
- **Presentación interactiva** (modal tipo slideshow) con productos, origen y cómo pedir.
- **Flujo de pedido "consultar disponibilidad"**: el cliente elige cantidad y se le
  invita a confirmar stock y fecha de entrega por WhatsApp o teléfono antes de comprar
  (los precios no se muestran porque fluctúan).
- **Sección legal** con documentos de la empresa (Permiso Sanitario SACS, RIF SENIAT).
- **SEO fuerte**: metadata, Open Graph, Twitter Cards, JSON-LD (FoodEstablishment),
  sitemap y robots.
- Paleta tomada del logo: rojo/vino, amarillo dorado, blanco y negro.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # genera la exportación estática en ./out
```

## Despliegue

Sitio estático (`output: 'export'`) desplegado en **Cloudflare Pages**:

```bash
npm run build
npx wrangler pages deploy out --project-name harinas-don-pedro
```

## Contacto de la empresa

- Teléfonos / WhatsApp: 0414-375.96.03 · 0412-375.96.03 · 0424-737.99.82
- Correo: jmmcoromoto2020@gmail.com
- Instagram: [@donpedro.vnlz](https://instagram.com/donpedro.vnlz)
- Ubicación: Ejido, Estado Mérida, Venezuela
- RIF: J-50656833-0 · Registro Sanitario: MER-TIPO 1-000753394
