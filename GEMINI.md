# Orchids Concert Management App (ConcertHub)

## Project Overview
This is a **Next.js 15** application designed as a management dashboard ("ConcertHub") for organizing concerts, artists, and venues. It features a modern, dark-themed UI with a sidebar navigation layout.

## Tech Stack
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** 
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Radix UI](https://www.radix-ui.com/) (Primitives)
  - [Lucide React](https://lucide.dev/) (Icons)
  - Likely uses [shadcn/ui](https://ui.shadcn.com/) components (located in `src/components/ui`).
- **Backend & Database:** [Supabase](https://supabase.com/) (Auth, Database, Storage).
- **Animation:** [Framer Motion](https://www.framer.com/motion/).
- **3D/Visuals:** React Three Fiber (dependencies present).
- **Package Manager:** npm / bun (lockfile present).

## Project Structure
The project follows the standard Next.js App Router structure:

- **`src/app/`**: Contains the application routes and pages.
  - `layout.tsx`: Root layout including `Sidebar`, `TopBar`, and global providers (`Toaster`).
  - `page.tsx`: Main dashboard entry point.
- **`src/components/`**: Reusable UI components.
  - `ui/`: Low-level UI components (likely shadcn/ui).
  - Feature components: `Sidebar`, `TopBar`, `ErrorReporter`, etc.
- **`src/lib/`**: Utility functions and configuration.
  - `supabase.ts`: Client-side Supabase client.
  - `supabase-server.ts`: Server-side Supabase client (using `@supabase/ssr` and cookies).
  - `utils.ts`: Helper functions (e.g., `cn` for class merging).

## Environment Variables
The application requires the following environment variables (typically in `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous API key for your Supabase project.

## Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with Turbopack (`next dev --turbopack`). |
| `npm run build` | Builds the application for production (`next build`). |
| `npm run start` | Starts the production server (`next start`). |
| `npm run lint` | Runs ESLint to check for code quality issues. |

## Key Conventions & Notes
- **Theming:** The application defaults to a **dark mode** theme (`<html lang="en" className="dark">` in `layout.tsx`).
- **Layout:** Uses a fixed `Sidebar` (left) and `TopBar` (top) layout structure.
- **Data Fetching:** Utilizes Supabase for both client-side and server-side data fetching.
- **Imports:** Uses the `@/` alias for absolute imports from the `src` directory.
- **Dependencies:** `drizzle-orm` is present in `package.json` but appears unused in the `src` directory; the project primarily relies on Supabase.
