# API Integration Guide - LassRiver NS

## Descripción General

Este documento describe cómo integrar el frontend de LassRiver NS con un backend REST/GraphQL usando autenticación JWT.

---

## Setup Inicial

### 1. Instalar Cliente HTTP

```bash
pnpm add axios
# o
pnpm add @tanstack/react-query axios
```

### 2. Configurar Variables de Entorno

Crear archivo `.env`:

```env
VITE_API_BASE_URL=https://api.lassriver.com
VITE_API_TIMEOUT=30000
```

### 3. Crear Cliente API

Crear `/src/app/services/api.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Agregar token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Manejo de errores globales
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado - logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Servicios por Módulo

### Auth Service

`/src/app/services/authService.ts`:

```typescript
import apiClient from './api';
import { User } from '../data/mockData';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  /**
   * POST /api/auth/login
   * Autentica usuario y retorna token JWT
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Guardar token y usuario
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('current_user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * POST /api/auth/register
   * Registra nuevo usuario
   */
  async register(data: { name: string; email: string; password: string }): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', data);
    
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('current_user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * POST /api/auth/logout
   * Cierra sesión (invalida token en backend)
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  },

  /**
   * GET /api/auth/me
   * Obtiene usuario actual (validar token)
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },
};
```

### Books Service

`/src/app/services/booksService.ts`:

```typescript
import apiClient from './api';
import { Book } from '../data/mockData';

interface BooksQuery {
  search?: string;
  category?: string;
  language?: string;
  rating?: number;
  available?: boolean;
  page?: number;
  limit?: number;
}

interface BooksResponse {
  books: Book[];
  total: number;
  page: number;
  pages: number;
}

export const booksService = {
  /**
   * GET /api/books
   * Obtiene listado de libros con filtros y paginación
   */
  async getBooks(query: BooksQuery = {}): Promise<BooksResponse> {
    const response = await apiClient.get('/books', { params: query });
    return response.data;
  },

  /**
   * GET /api/books/:id
   * Obtiene detalle de un libro específico
   */
  async getBookById(id: string): Promise<Book> {
    const response = await apiClient.get(`/books/${id}`);
    return response.data.book;
  },

  /**
   * POST /api/books
   * Crea un nuevo libro (Admin/Librarian)
   */
  async createBook(book: Omit<Book, 'id'>): Promise<Book> {
    const response = await apiClient.post('/books', book);
    return response.data.book;
  },

  /**
   * PUT /api/books/:id
   * Actualiza libro existente (Admin/Librarian)
   */
  async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
    const response = await apiClient.put(`/books/${id}`, updates);
    return response.data.book;
  },

  /**
   * DELETE /api/books/:id
   * Elimina libro (Admin only)
   */
  async deleteBook(id: string): Promise<void> {
    await apiClient.delete(`/books/${id}`);
  },
};
```

### Favorites Service

`/src/app/services/favoritesService.ts`:

```typescript
import apiClient from './api';

export const favoritesService = {
  /**
   * GET /api/favorites
   * Obtiene IDs de libros favoritos del usuario actual
   */
  async getFavorites(): Promise<string[]> {
    const response = await apiClient.get('/favorites');
    return response.data.favorites;
  },

  /**
   * POST /api/favorites/:bookId
   * Agrega libro a favoritos
   */
  async addFavorite(bookId: string): Promise<string[]> {
    const response = await apiClient.post(`/favorites/${bookId}`);
    return response.data.favorites;
  },

  /**
   * DELETE /api/favorites/:bookId
   * Remueve libro de favoritos
   */
  async removeFavorite(bookId: string): Promise<string[]> {
    const response = await apiClient.delete(`/favorites/${bookId}`);
    return response.data.favorites;
  },
};
```

### Reviews Service

`/src/app/services/reviewsService.ts`:

```typescript
import apiClient from './api';
import { Review } from '../data/mockData';

export const reviewsService = {
  /**
   * GET /api/books/:bookId/reviews
   * Obtiene reseñas de un libro
   */
  async getReviewsByBook(bookId: string): Promise<Review[]> {
    const response = await apiClient.get(`/books/${bookId}/reviews`);
    return response.data.reviews;
  },

  /**
   * POST /api/books/:bookId/reviews
   * Crea nueva reseña
   */
  async createReview(
    bookId: string,
    data: { rating: number; comment: string }
  ): Promise<Review> {
    const response = await apiClient.post(`/books/${bookId}/reviews`, data);
    return response.data.review;
  },

  /**
   * PUT /api/reviews/:id
   * Actualiza reseña propia
   */
  async updateReview(
    id: string,
    data: { rating?: number; comment?: string }
  ): Promise<Review> {
    const response = await apiClient.put(`/reviews/${id}`, data);
    return response.data.review;
  },

  /**
   * DELETE /api/reviews/:id
   * Elimina reseña propia
   */
  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}`);
  },

  /**
   * POST /api/reviews/:id/flag
   * Marca reseña para moderación (Admin/Librarian)
   */
  async flagReview(id: string, reason: string): Promise<Review> {
    const response = await apiClient.post(`/reviews/${id}/flag`, { reason });
    return response.data.review;
  },
};
```

### Loans Service

`/src/app/services/loansService.ts`:

```typescript
import apiClient from './api';
import { Loan } from '../data/mockData';

interface LoansQuery {
  status?: 'active' | 'overdue' | 'returned';
  userId?: string;
  page?: number;
  limit?: number;
}

interface LoansResponse {
  loans: Loan[];
  total: number;
}

export const loansService = {
  /**
   * GET /api/loans
   * Obtiene listado de préstamos (Admin/Librarian)
   */
  async getLoans(query: LoansQuery = {}): Promise<LoansResponse> {
    const response = await apiClient.get('/loans', { params: query });
    return response.data;
  },

  /**
   * POST /api/loans
   * Crea nuevo préstamo (Admin/Librarian)
   */
  async createLoan(data: {
    bookId: string;
    userId: string;
    dueDate: string;
  }): Promise<Loan> {
    const response = await apiClient.post('/loans', data);
    return response.data.loan;
  },

  /**
   * PUT /api/loans/:id
   * Actualiza préstamo (Admin/Librarian)
   */
  async updateLoan(
    id: string,
    updates: { status?: string; returnDate?: string }
  ): Promise<Loan> {
    const response = await apiClient.put(`/loans/${id}`, updates);
    return response.data.loan;
  },
};
```

---

## Integración con Context

Actualizar `/src/app/context/AppContext.tsx`:

```typescript
import { authService } from '../services/authService';
import { booksService } from '../services/booksService';
import { favoritesService } from '../services/favoritesService';
import { reviewsService } from '../services/reviewsService';

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login con API
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await authService.login({ email, password });
      setCurrentUser(user);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar libros con API
  const loadBooks = async (filters: BooksQuery = {}) => {
    try {
      setLoading(true);
      const data = await booksService.getBooks(filters);
      setBooks(data.books);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar libros');
    } finally {
      setLoading(false);
    }
  };

  // ... resto de funciones
}
```

---

## React Query Integration (Recomendado)

### Setup

```bash
pnpm add @tanstack/react-query
```

`/src/app/App.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </QueryClientProvider>
  );
}
```

### Hooks Personalizados

`/src/app/hooks/useBooks.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksService } from '../services/booksService';

export function useBooks(filters?: BooksQuery) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => booksService.getBooks(filters),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => booksService.getBookById(id),
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: booksService.createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
```

`/src/app/hooks/useFavorites.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '../services/favoritesService';
import { toast } from 'sonner';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesService.getFavorites,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, isFavorite }: { bookId: string; isFavorite: boolean }) => {
      return isFavorite
        ? favoritesService.removeFavorite(bookId)
        : favoritesService.addFavorite(bookId);
    },
    onSuccess: (_, { isFavorite }) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos');
    },
    onError: () => {
      toast.error('Error al actualizar favoritos');
    },
  });
}
```

### Uso en Componentes

```typescript
function Catalog() {
  const { data, isLoading, error } = useBooks({ category: 'Ficción' });
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  if (isLoading) return <BookGridSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      {data?.books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          isFavorite={favorites?.includes(book.id)}
          onToggleFavorite={() =>
            toggleFavorite.mutate({
              bookId: book.id,
              isFavorite: favorites?.includes(book.id) || false,
            })
          }
        />
      ))}
    </div>
  );
}
```

---

## Manejo de Errores

### Error Boundary

`/src/app/components/ErrorBoundary.tsx`:

```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Algo salió mal"
          description="Ha ocurrido un error inesperado. Por favor, recarga la página."
          actionLabel="Recargar"
          onAction={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
```

### Toast para Errores

```typescript
// En servicios
catch (error: any) {
  const message = error.response?.data?.message || 'Error inesperado';
  toast.error(message);
  throw error;
}
```

---

## Testing

### Mock de API con MSW

```bash
pnpm add -D msw
```

`/src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import { mockBooks, mockUsers } from '../app/data/mockData';

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email } = await request.json();
    const user = mockUsers.find((u) => u.email === email);

    if (!user) {
      return HttpResponse.json({ message: 'Usuario no encontrado' }, { status: 401 });
    }

    return HttpResponse.json({
      user,
      token: 'mock-jwt-token',
    });
  }),

  http.get('/api/books', () => {
    return HttpResponse.json({
      books: mockBooks,
      total: mockBooks.length,
      page: 1,
      pages: 1,
    });
  }),
];
```

---

## Checklist de Integración

- [ ] Instalar axios o fetch wrapper
- [ ] Configurar variables de entorno
- [ ] Crear cliente API con interceptors
- [ ] Implementar servicios por módulo
- [ ] Integrar con Context o React Query
- [ ] Agregar manejo de errores global
- [ ] Implementar loading states
- [ ] Configurar refresh token (opcional)
- [ ] Agregar tests con MSW
- [ ] Documentar endpoints en Swagger/OpenAPI

---

## Próximos Pasos

1. **Optimistic Updates**: Actualizar UI antes de respuesta
2. **Offline Support**: Caché con Service Workers
3. **WebSockets**: Para notificaciones en tiempo real
4. **Pagination**: Scroll infinito o paginación
5. **File Upload**: Para portadas de libros
