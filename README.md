# stockresto

Sistema de inventario para restaurantes: control de stock, movimientos y estadísticas de consumo.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router, Turbopack) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (estilo New York)
- [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [Recharts](https://recharts.org/) para gráficos
- [date-fns](https://date-fns.org/), [lucide-react](https://lucide.dev/)

## Cómo correrlo localmente

```bash
npm install
cp .env.local.example .env.local   # completar con las credenciales de Supabase
npm run dev
```

La app queda disponible en [http://localhost:3000](http://localhost:3000).

## Estado

MVP en desarrollo.
