# Pinwall

Photo sharing app. React + Vite + Supabase.

## Stack
- Frontend: React, Vite, running at localhost:5173
- Auth: Supabase auth
- Storage: Supabase storage (photos bucket)
- DB: Supabase postgres

## Architecture summary

### Components
- `Pinwall` — root component, manages session/auth/view state
- `HorizontalWall` — the main photo wall, items saved to `walls` table
- `Bookshelf` — displays shelves of books, shelf data saved to `shelves` table
- `PhotoBook` — opens a single book, item positions saved to `album_states` table

### Supabase tables
- `walls` — columns: user_id, items (jsonb). One row per user.
- `shelves` — columns: user_id, albums (jsonb). One row per user.
- `album_states` — columns: user_id, album_id (bigint), data (jsonb). One row per user per album.

### Key patterns
- Supabase client imported from ./src/supabase.js
- All saves use upsert with onConflict on user_id
- Debounce saves by 1.5s using a ref + setTimeout
- hasLoaded ref pattern used in PhotoBook and Bookshelf to prevent save overwriting load
- New book ids use Date.now() — album_states album_id is bigint to support this
- Auth logic stays out of HorizontalWall and PhotoBook — session passed as prop

## Conventions
- No TypeScript, plain JSX
- Inline styles throughout, no CSS modules
- Fonts: Caveat, Playfair Display, Lato (Google Fonts)