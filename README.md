# ADN Puebla

Plataforma educativa (landing + LMS) para ADN Puebla. Monorepo con dos apps:

- `apps/web` — Frontend en React + Vite + Tailwind + Supabase.
- `apps/api` — Servidor Express mínimo (solo `/health` por ahora; el resto de la
  app habla directo con Supabase desde el cliente).

## Requisitos

- Node.js 18+
- Un proyecto de [Supabase](https://supabase.com)

## Puesta en marcha

1. **Base de datos**: en el SQL Editor de tu proyecto de Supabase, ejecuta en orden:
   1. `supabase-schema.sql` — esquema base (tablas, datos iniciales, RLS).
   2. `supabase-migration-001-fixes.sql` — columnas/tablas/políticas que
      el esquema base no incluía pero que el frontend necesita
      (`questions`, `sponsor_links`, `profile_change_log`, `profiles.status`,
      etc.). Ver el encabezado del archivo para el detalle completo.
   3. `supabase-migration-002-teachers-groups-audit.sql` — agrega el rol
      `profesor`, la tabla `groups` (grupos/cohortes), `profiles.group_id`
      y `audit_log` (bitácora inmutable de acciones sensibles, visible solo
      para admin). Es indispensable: `AdminPage.jsx` (gestión de grupos) y
      `TeacherPanelPage.jsx` (panel del profesor) ya dependen de estas tablas.

2. **Crea tu usuario admin**: Authentication → Users → Add User en Supabase,
   luego en el SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin', status = 'activo' WHERE id = 'TU-UUID-AQUI';
   ```

3. **Variables de entorno**: copia `apps/web/.env.example` a `apps/web/.env`
   y complétalo con los datos de tu proyecto (Settings → API):
   ```
   VITE_SUPABASE_URL=https://riqlkzzqkkiytoonnysj.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
   ```
   La clave anónima (`anon public`) la obtienes en Supabase → Settings → API
   de ese proyecto. Nunca uses la `service_role` key en el frontend.

4. **Función de notificación por correo (opcional)**: el registro de
   prospectos intenta llamar a una Edge Function `notify-email` en
   `${VITE_SUPABASE_URL}/functions/v1/notify-email`. Esa función no está
   incluida en este repo — si la quieres, créala en Supabase Functions
   (recibe `{ type, data }` y envía el correo con el proveedor que prefieras)
   o elimina las llamadas a `notifyAdmin`/`notifyEmail` si no la necesitas.
   Mientras no exista, el registro sigue funcionando igual: el `fetch` está
   envuelto en `try/catch` y no bloquea el flujo.

5. **Instalar y correr**:
   ```bash
   npm install
   npm run dev        # web + api en paralelo
   npm run dev:web     # solo frontend
   ```

## Despliegue en Vercel

Este repo es un monorepo (npm workspaces) con `vercel.json` en la raíz ya
configurado para construir solo `apps/web`:

1. Importa el repositorio de GitHub en Vercel (Root Directory = raíz del
   repo, **no** cambies a `apps/web`; `vercel.json` ya apunta ahí).
2. En Project Settings → Environment Variables agrega:
   - `VITE_SUPABASE_URL` = `https://riqlkzzqkkiytoonnysj.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = tu clave `anon public` de Supabase
3. Deploy. Vercel corre `npm install` en la raíz y luego `npm run build`
   (que a su vez ejecuta `vite build` dentro de `apps/web`), publicando
   `apps/web/dist`.

`apps/api` (Express, solo `/health` por ahora) no se despliega en Vercel;
el frontend habla directo con Supabase. Si más adelante necesitas ese
servidor, despliégalo aparte (Railway, Render, Fly.io, etc.) o conviértelo
en una Vercel Function.

## Estructura

```
apps/
  web/   # React + Vite + Tailwind + shadcn/ui + Supabase
  api/   # Express (esqueleto, solo /health)
supabase-schema.sql              # esquema base
supabase-migration-001-fixes.sql # columnas/tablas/políticas faltantes
```
