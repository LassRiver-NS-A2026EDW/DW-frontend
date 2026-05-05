# LassRiver NS - Handoff Documentation

## Overview
LassRiver NS es una plataforma de biblioteca digital premium diseñada para gestionar libros, préstamos, reseñas y usuarios con diferentes roles de acceso.

## Tech Stack
- **Framework**: React 18.3.1 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **State Management**: React Context API
- **Notifications**: Sonner (Toast)

---

## Estructura de Rutas Sugerida

### Rutas Públicas
- `/` - Home/Landing page
- `/login` - Página de inicio de sesión
- `/register` - Página de registro
- `/catalog` - Catálogo público de libros
- `/books/:id` - Detalle de libro
- `/unauthorized` - Página 401/403

### Rutas Protegidas (Requieren Autenticación)
- `/favorites` - Libros favoritos del usuario
- `/profile` - Perfil y preferencias
- `/reviews` - Reseñas del usuario

### Rutas Administrativas (Admin/Librarian)
- `/admin` - Dashboard administrativo
- `/admin/books` - Gestión de libros
- `/admin/loans` - Gestión de préstamos
- `/admin/reviews` - Moderación de reseñas

---

## API Endpoints a Integrar

### Autenticación
```typescript
// POST /api/auth/login
// Body: { email: string, password: string }
// Response: { user: User, token: string }

// POST /api/auth/register
// Body: { name: string, email: string, password: string }
// Response: { user: User, token: string }

// POST /api/auth/logout
// Headers: { Authorization: Bearer <token> }
// Response: { success: boolean }

// GET /api/auth/me
// Headers: { Authorization: Bearer <token> }
// Response: { user: User }
```

### Libros
```typescript
// GET /api/books
// Query: { search?, category?, language?, rating?, available?, page?, limit? }
// Response: { books: Book[], total: number, page: number, pages: number }

// GET /api/books/:id
// Response: { book: Book }

// POST /api/books (Admin/Librarian)
// Headers: { Authorization: Bearer <token> }
// Body: Omit<Book, 'id'>
// Response: { book: Book }

// PUT /api/books/:id (Admin/Librarian)
// Headers: { Authorization: Bearer <token> }
// Body: Partial<Book>
// Response: { book: Book }

// DELETE /api/books/:id (Admin)
// Headers: { Authorization: Bearer <token> }
// Response: { success: boolean }
```

### Favoritos
```typescript
// GET /api/favorites
// Headers: { Authorization: Bearer <token> }
// Response: { favorites: string[] } // Array de book IDs

// POST /api/favorites/:bookId
// Headers: { Authorization: Bearer <token> }
// Response: { favorites: string[] }

// DELETE /api/favorites/:bookId
// Headers: { Authorization: Bearer <token> }
// Response: { favorites: string[] }
```

### Reseñas
```typescript
// GET /api/books/:bookId/reviews
// Response: { reviews: Review[] }

// POST /api/books/:bookId/reviews
// Headers: { Authorization: Bearer <token> }
// Body: { rating: number, comment: string }
// Response: { review: Review }

// PUT /api/reviews/:id
// Headers: { Authorization: Bearer <token> }
// Body: { rating?: number, comment?: string }
// Response: { review: Review }

// DELETE /api/reviews/:id
// Headers: { Authorization: Bearer <token> }
// Response: { success: boolean }

// POST /api/reviews/:id/flag (Admin/Librarian)
// Headers: { Authorization: Bearer <token> }
// Body: { reason: string }
// Response: { review: Review }
```

### Préstamos
```typescript
// GET /api/loans (Admin/Librarian)
// Headers: { Authorization: Bearer <token> }
// Query: { status?, userId?, page?, limit? }
// Response: { loans: Loan[], total: number }

// POST /api/loans (Admin/Librarian)
// Headers: { Authorization: Bearer <token> }
// Body: { bookId: string, userId: string, dueDate: string }
// Response: { loan: Loan }

// PUT /api/loans/:id (Admin/Librarian)
// Headers: { Authorization: Bearer <token> }
// Body: { status?: string, returnDate?: string }
// Response: { loan: Loan }
```

### Perfil
```typescript
// GET /api/profile
// Headers: { Authorization: Bearer <token> }
// Response: { user: User }

// PUT /api/profile
// Headers: { Authorization: Bearer <token> }
// Body: { name?: string, email?: string }
// Response: { user: User }
```

---

## Estados de Pantallas

### Loading States
- Catálogo: `<BookGridSkeleton count={8} />`
- Detalle de libro: `<BookDetailSkeleton />`
- Tabla admin: `<TableSkeleton rows={5} />`

### Empty States
- Catálogo sin resultados: EmptyState con icono Search
- Favoritos vacíos: EmptyState con icono Heart
- Reseñas vacías: EmptyState con icono MessageSquare
- Sin préstamos: EmptyState con icono BookOpen

### Error States
- Error de red: Card con mensaje de error y botón "Reintentar"
- 401 No autorizado: Redirect a /login
- 403 Prohibido: Pantalla de acceso denegado
- 404 No encontrado: Página no encontrada

### Success States
- Login exitoso: Toast + Redirect
- Registro exitoso: Toast + Redirect
- Favorito agregado: Toast notification
- Reseña publicada: Toast + Actualización UI

---

## Design System

### Tokens de Color
```css
/* Brand Colors */
--primary-navy: #182858
--deep-blue: #183868
--river-cyan: #1898A8
--aqua-blue: #1888A8
--leaf-green: #68B848
--fresh-green: #78B848

/* Background */
--background-dark: #07111F
--surface: #0E1A2F
--surface-light: #F7FAFC

/* Text */
--text-main: #EAF2FF
--text-muted: #8EA4C8

/* Border */
--border-color: rgba(255,255,255,0.10)
```

### Espaciado
```css
--spacing-xs: 0.25rem (4px)
--spacing-sm: 0.5rem (8px)
--spacing-md: 1rem (16px)
--spacing-lg: 1.5rem (24px)
--spacing-xl: 2rem (32px)
--spacing-2xl: 3rem (48px)
```

### Radios
```css
--radius-sm: 0.375rem (6px)
--radius-md: 0.5rem (8px)
--radius-lg: 0.75rem (12px)
--radius-xl: 1rem (16px)
--radius-2xl: 1.5rem (24px)
```

### Sombras
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15)
```

### Tipografía
- **Font Family**: Inter (sistema por defecto)
- **Headings**: 
  - H1: 2rem (32px), font-weight: 700
  - H2: 1.5rem (24px), font-weight: 600
  - H3: 1.25rem (20px), font-weight: 600
  - H4: 1rem (16px), font-weight: 500
- **Body**: 0.875rem (14px), font-weight: 400
- **Small**: 0.75rem (12px), font-weight: 400

---

## Componentes Principales

### Button
**Variantes**: default, secondary, outline, ghost, destructive, link
**Tamaños**: sm, default, lg, icon
**Estados**: hover, active, focus, disabled, loading

```tsx
<Button variant="default" size="lg">
  Acción Principal
</Button>
```

### Input
**Estados**: default, focus, error, disabled
```tsx
<Input 
  placeholder="Buscar..." 
  aria-invalid={hasError}
/>
```

### Card
**Uso**: Contenedor principal para contenido agrupado
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Contenido</CardContent>
</Card>
```

### Badge
**Variantes**: default, secondary, destructive, outline
```tsx
<Badge variant="default">Activo</Badge>
<StatusBadge status="available" />
<RoleBadge role="admin" />
```

### RatingStars
**Props**: rating, onRatingChange, readonly, size, showLabel
```tsx
<RatingStars 
  rating={4.5} 
  onRatingChange={(r) => setRating(r)}
  size="md"
  showLabel
/>
```

### EmptyState
**Props**: icon, title, description, actionLabel, onAction
```tsx
<EmptyState
  icon={Heart}
  title="No tienes favoritos"
  description="Explora el catálogo..."
  actionLabel="Ir al Catálogo"
  onAction={() => navigate('/catalog')}
/>
```

---

## Notas de Implementación

### Autenticación JWT
1. Guardar token en localStorage o httpOnly cookie
2. Incluir token en header Authorization: `Bearer <token>`
3. Interceptor para renovar token expirado
4. Redirect a /login si token inválido

### Roles y Permisos
- **Usuario**: Acceso a catálogo, favoritos, reseñas, perfil
- **Bibliotecario**: Todo lo anterior + gestión de préstamos y moderación
- **Administrador**: Acceso completo + gestión de libros

### Validaciones Frontend
- Email: Formato válido
- Password: Mínimo 8 caracteres
- Reseñas: Máximo 500 caracteres
- ISBN: Formato ISBN-10 o ISBN-13

### Optimizaciones
- Lazy loading de imágenes de portadas
- Paginación en catálogo (12 libros por página)
- Debounce en búsqueda (300ms)
- Cache de datos con React Query o SWR

### Accesibilidad
- Contraste WCAG AA
- Labels en todos los inputs
- Focus visible en elementos interactivos
- Alt text en imágenes
- Keyboard navigation
- Screen reader friendly

---

## Archivos Mock a Reemplazar

### `/src/app/data/mockData.ts`
Contiene datos de prueba:
- `mockBooks`: Array de libros de ejemplo
- `mockReviews`: Reseñas de prueba
- `mockUsers`: Usuarios de prueba
- `mockLoans`: Préstamos de ejemplo

**Acción**: Reemplazar con llamadas API usando fetch/axios

### `/src/app/context/AppContext.tsx`
Contiene lógica de estado local.

**Acción**: 
1. Mantener estructura de contexto
2. Reemplazar funciones con llamadas API
3. Agregar manejo de loading/error states
4. Implementar optimistic updates

---

## Próximos Pasos

### Fase 1: Backend Integration
- [ ] Configurar cliente API (axios/fetch)
- [ ] Implementar servicio de autenticación
- [ ] Conectar endpoints de libros
- [ ] Conectar endpoints de favoritos y reseñas

### Fase 2: Optimización
- [ ] Implementar React Query o SWR
- [ ] Lazy loading de rutas
- [ ] Optimización de imágenes
- [ ] Error boundaries

### Fase 3: Testing
- [ ] Unit tests para componentes
- [ ] Integration tests para flujos principales
- [ ] E2E tests con Playwright/Cypress

### Fase 4: Deployment
- [ ] Variables de entorno
- [ ] Build optimization
- [ ] CI/CD pipeline
- [ ] Monitoring y analytics

---

## Contacto y Soporte

Para preguntas sobre la implementación, consultar:
- Documentación de componentes en `/src/app/components`
- Design system en `/src/styles/theme.css`
- Tipos TypeScript en `/src/app/data/mockData.ts`
