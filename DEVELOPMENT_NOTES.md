# Development Notes - LassRiver NS

## 🎯 Principios de Desarrollo

### 1. Component-First Approach
- Cada vista debe usar componentes compartidos del design system
- No duplicar código de UI - reutilizar componentes existentes
- Mantener componentes pequeños y enfocados en una responsabilidad

### 2. Type Safety
- Usar TypeScript estricto en todos los archivos
- Definir interfaces para todas las props
- No usar `any` - preferir `unknown` y type guards

### 3. Performance
- Lazy load de rutas con React.lazy()
- Memoización selectiva con useMemo/useCallback
- Virtualización para listas largas (>100 items)
- Optimización de imágenes (lazy loading, WebP)

### 4. Accessibility First
- Todo elemento interactivo debe tener focus visible
- Forms con labels apropiados
- ARIA attributes donde sea necesario
- Keyboard navigation completo

---

## 🔄 State Management

### Context Structure

```typescript
AppContext
├── User State (currentUser, login, logout)
├── Books State (books, selectedBook, filters)
├── Reviews State (reviews, addReview, deleteReview)
├── Favorites State (favorites, toggleFavorite)
├── Loans State (loans, addLoan, updateLoan)
└── UI State (theme, sidebar, currentView)
```

### Cuándo Usar Context vs Local State

**Context (Global):**
- Autenticación del usuario
- Datos de catálogo de libros
- Favoritos del usuario
- Configuración de tema

**Local State:**
- Form inputs
- Modal open/close
- Hover states
- Temporary UI state

**Server State (React Query):**
- Datos de API
- Cache de requests
- Optimistic updates
- Background refetch

---

## 🎨 Styling Guidelines

### Tailwind CSS Best Practices

```tsx
// ✅ GOOD - Componible y mantenible
<Card className="hover:shadow-xl transition-shadow duration-300">
  <CardContent className="p-6 space-y-4">
    <h2 className="text-2xl font-semibold">Título</h2>
    <p className="text-muted-foreground">Descripción</p>
  </CardContent>
</Card>

// ❌ BAD - Inline styles, difícil de mantener
<div style={{ boxShadow: '0 0 20px rgba(0,0,0,0.1)', padding: '24px' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Título</h2>
</div>
```

### Responsive Design

```tsx
// Mobile first approach
<div className="
  grid 
  grid-cols-1          // Mobile: 1 columna
  md:grid-cols-2       // Tablet: 2 columnas
  lg:grid-cols-3       // Desktop: 3 columnas
  xl:grid-cols-4       // Large: 4 columnas
  gap-6
">
```

---

## 🔒 Security Best Practices

### 1. XSS Prevention
```tsx
// ✅ GOOD - React escapa automáticamente
<p>{user.comment}</p>

// ❌ BAD - Nunca usar dangerouslySetInnerHTML sin sanitizar
<div dangerouslySetInnerHTML={{ __html: userComment }} />
```

### 2. CSRF Protection
```typescript
// En API client
apiClient.defaults.headers.common['X-CSRF-Token'] = getCsrfToken();
```

### 3. Sensitive Data
```typescript
// ✅ GOOD - No logs de datos sensibles
console.log('Login attempt for user:', email);

// ❌ BAD
console.log('User password:', password);
```

### 4. JWT Storage
```typescript
// Considerar httpOnly cookies en producción
// localStorage es OK para desarrollo, pero httpOnly es más seguro
localStorage.setItem('auth_token', token); // Dev
// En prod: backend setea httpOnly cookie
```

---

## 📦 Code Organization

### File Naming Conventions

```
components/
├── layout/
│   ├── Sidebar.tsx          # PascalCase para componentes
│   └── Topbar.tsx
├── shared/
│   ├── EmptyState.tsx
│   └── RatingStars.tsx
├── ui/
│   ├── button.tsx           # lowercase para primitivos
│   └── card.tsx
└── views/
    ├── Catalog.tsx
    └── BookDetail.tsx

services/
├── authService.ts           # camelCase para servicios
├── booksService.ts
└── api.ts

types/
└── index.ts                 # Exportar todas las interfaces

utils/
└── formatters.ts            # Funciones helper
```

### Import Order

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal modules
import { useApp } from '../../context/AppContext';
import { booksService } from '../../services/booksService';

// 3. Components
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { EmptyState } from '../shared/EmptyState';

// 4. Types
import type { Book, User } from '../../types';

// 5. Styles/Assets
import './styles.css';
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Componentes puros
describe('RatingStars', () => {
  it('renders correct number of stars', () => {
    render(<RatingStars rating={3} readonly />);
    expect(screen.getAllByRole('img')).toHaveLength(5);
  });

  it('calls onRatingChange when clicked', () => {
    const handleChange = vi.fn();
    render(<RatingStars rating={0} onRatingChange={handleChange} />);
    
    fireEvent.click(screen.getAllByRole('button')[2]);
    expect(handleChange).toHaveBeenCalledWith(3);
  });
});
```

### Integration Tests
```typescript
// Flujos completos
describe('Book Catalog', () => {
  it('filters books by category', async () => {
    render(<Catalog />);
    
    const categorySelect = screen.getByLabelText('Categoría');
    fireEvent.change(categorySelect, { target: { value: 'Ficción' } });
    
    await waitFor(() => {
      expect(screen.getByText('Cien Años de Soledad')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests
```typescript
// Con Playwright
test('user can add book to favorites', async ({ page }) => {
  await page.goto('/catalog');
  await page.click('[data-testid="book-card-1"]');
  await page.click('[data-testid="favorite-button"]');
  
  await expect(page.locator('[data-testid="toast"]')).toContainText('Agregado a favoritos');
});
```

---

## 🚀 Performance Optimization

### 1. Code Splitting
```typescript
// Lazy load de rutas
const Catalog = lazy(() => import('./components/views/Catalog'));
const Admin = lazy(() => import('./components/views/Admin'));

<Suspense fallback={<LoadingSkeleton />}>
  <Catalog />
</Suspense>
```

### 2. Image Optimization
```tsx
// Lazy loading de imágenes
<img
  src={book.coverUrl}
  alt={book.title}
  loading="lazy"
  decoding="async"
/>
```

### 3. Memoization
```typescript
// Solo cuando sea necesario
const filteredBooks = useMemo(() => {
  return books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [books, searchQuery]);
```

### 4. Debouncing
```typescript
// Para búsquedas
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    setSearchQuery(query);
  }, 300),
  []
);
```

---

## 🔍 Debugging Tips

### React DevTools
- Profiler para detectar re-renders innecesarios
- Components tree para inspeccionar props/state
- Hooks para ver valores en tiempo real

### Console Tricks
```typescript
// Debugging condicional
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { user, books });
}

// Performance timing
console.time('loadBooks');
await booksService.getBooks();
console.timeEnd('loadBooks');
```

### Network Debugging
```typescript
// Log de requests en desarrollo
apiClient.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log('→', config.method?.toUpperCase(), config.url);
  }
  return config;
});
```

---

## 📝 Git Workflow

### Commit Message Convention
```
feat: Add book detail loading skeleton
fix: Resolve rating stars not updating
refactor: Extract book card to shared component
docs: Update API integration guide
style: Format catalog filters
test: Add unit tests for RatingStars
perf: Optimize book grid rendering
```

### Branch Naming
```
feature/book-detail-skeleton
bugfix/rating-stars-update
refactor/extract-book-card
docs/api-integration
```

---

## 🔐 Environment Variables

### Development (.env.development)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_ENABLE_MOCK=true
```

### Production (.env.production)
```env
VITE_API_BASE_URL=https://api.lassriver.com
VITE_API_TIMEOUT=10000
VITE_ENABLE_MOCK=false
VITE_SENTRY_DSN=https://...
```

### Usage
```typescript
const API_URL = import.meta.env.VITE_API_BASE_URL;
const IS_MOCK = import.meta.env.VITE_ENABLE_MOCK === 'true';
```

---

## 🎯 Common Patterns

### Error Handling
```typescript
try {
  setLoading(true);
  const data = await booksService.getBooks();
  setBooks(data.books);
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error('Error inesperado');
    console.error(error);
  }
} finally {
  setLoading(false);
}
```

### Loading States
```typescript
function BookList() {
  const { data, isLoading, error } = useBooks();

  if (isLoading) return <BookGridSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data?.books.length) return <EmptyState icon={Search} />;

  return <BookGrid books={data.books} />;
}
```

### Form Validation
```typescript
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  
  if (!validateEmail(email)) {
    toast.error('Email inválido');
    return;
  }
  
  // Continue...
};
```

---

## 🐛 Known Issues & Workarounds

### Issue: Radix Select in Modals
**Problem:** Select dropdown se corta en modals
**Workaround:**
```tsx
<SelectContent position="popper" sideOffset={5}>
```

### Issue: Image Lazy Loading
**Problem:** Algunas imágenes no cargan en Safari
**Workaround:**
```tsx
<img loading="lazy" decoding="async" />
// Fallback para Safari antiguo
```

---

## 📈 Monitoring & Analytics

### Performance Metrics
```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Error Tracking
```typescript
// Sentry integration (futuro)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

## 🎓 Resources

### Documentation
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [TypeScript](https://typescriptlang.org)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [ES7+ React Snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)

---

**Última actualización: 2026-05-04**
