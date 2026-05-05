# LassRiver NS - Design System

## Identidad Visual

### Concepto
LassRiver NS representa el flujo de conocimiento como un río digital. La identidad visual combina:
- **Azul profundo**: Confianza, conocimiento, profundidad intelectual
- **Cyan tecnológico**: Innovación, modernidad, fluidez digital
- **Verde natural**: Crecimiento, aprendizaje, renovación

### Logo
El logo de LassRiver NS presenta ondas fluidas que simbolizan el flujo continuo de información y conocimiento. Las tonalidades van del azul oscuro al verde, representando la transición del conocimiento establecido a nuevas ideas.

**Uso del logo:**
- Sidebar: 48px de altura
- Login/Register: 80px de altura
- Hero Home: 96px de altura
- Nunca distorsionar proporciones
- Mantener espacio de respiro mínimo de 16px

---

## Tokens de Color

### Colores Primarios
```css
/* Brand Identity */
--primary-navy: #182858      /* Acciones principales, navegación activa */
--deep-blue: #183868         /* Elementos secundarios, hover states */
--river-cyan: #1898A8        /* CTAs principales, links activos */
--aqua-blue: #1888A8         /* Acentos secundarios */
--leaf-green: #68B848        /* Estados positivos, success */
--fresh-green: #78B848       /* Highlights, featured content */
```

### Colores de Fondo
```css
/* Dark Mode (Default) */
--background-dark: #07111F   /* Fondo principal */
--surface: #0E1A2F           /* Tarjetas, modales, elevación */
--surface-light: #F7FAFC     /* Modo claro (futuro) */
```

### Colores de Texto
```css
--text-main: #EAF2FF         /* Texto principal */
--text-muted: #8EA4C8        /* Texto secundario, placeholders */
```

### Colores Semánticos
```css
--success: var(--leaf-green)
--warning: #F59E0B
--error: #EF4444
--info: var(--river-cyan)
```

### Bordes
```css
--border-color: rgba(255,255,255,0.10)  /* Bordes sutiles en dark mode */
--border-hover: rgba(255,255,255,0.20)
--border-focus: var(--river-cyan)
```

---

## Espaciado

### Sistema de Espaciado (8px base)
```css
--spacing-0: 0
--spacing-1: 0.25rem  /* 4px */
--spacing-2: 0.5rem   /* 8px */
--spacing-3: 0.75rem  /* 12px */
--spacing-4: 1rem     /* 16px */
--spacing-5: 1.25rem  /* 20px */
--spacing-6: 1.5rem   /* 24px */
--spacing-8: 2rem     /* 32px */
--spacing-10: 2.5rem  /* 40px */
--spacing-12: 3rem    /* 48px */
--spacing-16: 4rem    /* 64px */
```

### Aplicación
- **Contenedores**: padding de 24px (spacing-6)
- **Secciones**: margin-bottom de 24-32px
- **Elementos de lista**: gap de 16px (spacing-4)
- **Grupos de inputs**: gap de 12px (spacing-3)

---

## Radios de Borde

```css
--radius-sm: 0.375rem   /* 6px - Badges, chips */
--radius-md: 0.5rem     /* 8px - Inputs, buttons */
--radius-lg: 0.75rem    /* 12px - Cards pequeñas */
--radius-xl: 1rem       /* 16px - Cards estándar */
--radius-2xl: 1.5rem    /* 24px - Modals, containers grandes */
--radius-full: 9999px   /* Circular - Avatars, pills */
```

---

## Sombras

### Elevación
```css
/* Subtle */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)

/* Base */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
             0 2px 4px -1px rgba(0, 0, 0, 0.06)

/* Elevated */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
             0 4px 6px -2px rgba(0, 0, 0, 0.05)

/* High */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
             0 10px 10px -5px rgba(0, 0, 0, 0.04)

/* Glow Effects */
--shadow-glow-primary: 0 0 20px rgba(24, 152, 168, 0.3)
--shadow-glow-accent: 0 0 20px rgba(104, 184, 72, 0.3)
```

---

## Tipografía

### Familia
```css
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', 
             'Roboto', 'Helvetica Neue', Arial, sans-serif
```

### Escala Tipográfica
```css
/* Display */
--text-5xl: 3rem      /* 48px - Hero titles */
--text-4xl: 2.25rem   /* 36px - Page titles */
--text-3xl: 1.875rem  /* 30px - Section headers */
--text-2xl: 1.5rem    /* 24px - Card titles */
--text-xl: 1.25rem    /* 20px - Subsections */

/* Body */
--text-lg: 1.125rem   /* 18px - Large body */
--text-base: 1rem     /* 16px - Default body */
--text-sm: 0.875rem   /* 14px - Secondary text */
--text-xs: 0.75rem    /* 12px - Captions, labels */
```

### Peso de Fuente
```css
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Altura de Línea
```css
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.75
```

---

## Componentes

### Button

**Variantes:**
- `default`: Fondo primary-cyan, texto blanco
- `secondary`: Fondo secondary, texto blanco
- `outline`: Borde primary, fondo transparente
- `ghost`: Hover con fondo sutil
- `destructive`: Fondo rojo, para acciones peligrosas
- `link`: Estilo de enlace con subrayado

**Tamaños:**
- `sm`: h-8 (32px), px-3, text-sm
- `default`: h-9 (36px), px-4, text-base
- `lg`: h-10 (40px), px-6, text-base
- `icon`: size-9 (36x36px), centrado

**Estados:**
- Hover: Opacidad 90%, sombra sutil
- Active: Scale 98%
- Focus: Ring de 3px con color primary
- Disabled: Opacidad 50%, cursor not-allowed
- Loading: Spinner animado, texto oculto

### Input

**Estados:**
- Default: Borde border-color, fondo input-background
- Focus: Borde primary, ring de 3px
- Error: Borde destructive, ring destructive/20
- Disabled: Opacidad 50%, cursor not-allowed

**Validación Visual:**
- Success: Ícono de check verde a la derecha
- Error: Ícono de alerta roja + mensaje debajo
- Warning: Ícono de advertencia amarilla

### Card

**Estructura:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>Contenido principal</CardContent>
  <CardFooter>Acciones</CardFooter>
</Card>
```

**Variantes:**
- Default: Borde sutil, fondo surface
- Elevated: Sombra md en hover
- Interactive: Cursor pointer, escala en hover
- Dashed: Borde punteado para empty states

### Badge

**Variantes Semánticas:**
- `default`: Primary background
- `secondary`: Secondary background
- `destructive`: Red background para errores
- `outline`: Solo borde, fondo transparente
- `success`: Verde para estados positivos

**Uso de StatusBadge:**
```tsx
<StatusBadge status="available" />   // Verde: Disponible
<StatusBadge status="unavailable" /> // Rojo: No disponible
<StatusBadge status="active" />      // Azul: Activo
<StatusBadge status="overdue" />     // Rojo: Vencido
<StatusBadge status="returned" />    // Gris: Devuelto
```

**Uso de RoleBadge:**
```tsx
<RoleBadge role="user" />       // Secundario: Usuario
<RoleBadge role="librarian" />  // Primario: Bibliotecario
<RoleBadge role="admin" />      // Primario con shield: Admin
```

### RatingStars

**Props:**
- `rating`: number (0-5)
- `onRatingChange`: (rating: number) => void
- `readonly`: boolean
- `size`: 'sm' | 'md' | 'lg'
- `showLabel`: boolean (muestra número al lado)

**Estados:**
- Interactive: Hover scale 110%, cursor pointer
- Readonly: Sin hover, cursor default

### EmptyState

**Uso:**
```tsx
<EmptyState
  icon={Search}
  title="No se encontraron resultados"
  description="Intenta ajustar tus filtros..."
  actionLabel="Limpiar Filtros"
  onAction={() => resetFilters()}
/>
```

**Guidelines:**
- Ícono: 64x64px, color primary/10 en fondo circular
- Título: text-xl, font-semibold
- Descripción: max-w-md, text-center
- Acción opcional para resolver el estado

### Skeleton

**Componentes Pre-construidos:**
- `<BookCardSkeleton />`: Esqueleto de tarjeta de libro
- `<BookGridSkeleton count={8} />`: Grid de skeletons
- `<BookDetailSkeleton />`: Esqueleto de detalle
- `<TableSkeleton rows={5} />`: Esqueleto de tabla

**Animación:**
- Pulse suave con bg-muted/50
- Duración 1.5s, ease-in-out

---

## Patrones Visuales

### Patrón de Ondas (Wave Pattern)

Inspirado en el logo LassRiver NS. Uso:
- Fondos de login/register (opacidad 5%)
- Hero section en home (opacidad 10%)
- Fondos sutiles en secciones destacadas

**Implementación SVG:**
```svg
<pattern id="wave-pattern" width="100" height="100">
  <path d="M0 50 Q 25 25, 50 50 T 100 50" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        fill="none"/>
</pattern>
```

### Glassmorphism Sutil

Para paneles destacados:
```css
backdrop-filter: blur(8px);
background: rgba(14, 26, 47, 0.8);
border: 1px solid rgba(255, 255, 255, 0.1);
```

**Uso:**
- Modales y dialogs
- Tooltips importantes
- Navegación flotante

---

## Animaciones y Transiciones

### Duración
```css
--duration-fast: 150ms
--duration-base: 200ms
--duration-slow: 300ms
--duration-slower: 500ms
```

### Easing
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Transiciones Comunes
```css
/* Hover de Cards */
transition: all 200ms ease-in-out;
&:hover { 
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Focus de Inputs */
transition: border-color 150ms, box-shadow 150ms;

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Accesibilidad

### Contraste de Color
- Texto principal: Mínimo 7:1 (AAA)
- Texto secundario: Mínimo 4.5:1 (AA)
- Elementos interactivos: Mínimo 3:1

### Focus States
- Ring visible de 3px con color primary
- Offset de 2px para separación
- Nunca remover outline sin alternativa

### Keyboard Navigation
- Tab order lógico
- Skip links para navegación rápida
- Atajos de teclado documentados

### Screen Readers
- Labels en todos los inputs
- Alt text descriptivo en imágenes
- ARIA labels donde sea necesario
- Live regions para notificaciones

---

## Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Tablets pequeñas */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Pantallas grandes */
```

### Grid Adaptivo
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3-4 columnas (según contexto)

---

## Ejemplos de Uso

### Card de Libro Premium
```tsx
<Card className="group hover:shadow-xl transition-all duration-300">
  <div className="aspect-[3/4] relative overflow-hidden">
    <img 
      src={coverUrl} 
      className="group-hover:scale-105 transition-transform duration-500"
    />
    {!available && (
      <div className="absolute bottom-0 inset-x-0 bg-destructive/90 text-white py-2 text-center text-sm">
        No disponible
      </div>
    )}
  </div>
  <CardContent className="p-4 space-y-3">
    <h3 className="font-semibold line-clamp-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{author}</p>
    <RatingStars rating={rating} readonly size="sm" showLabel />
    <div className="flex gap-2">
      <Badge variant="secondary">{category}</Badge>
      <Badge variant="outline">{language}</Badge>
    </div>
  </CardContent>
</Card>
```

### Formulario con Validación
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <label className="text-sm font-medium">Email</label>
    <Input
      type="email"
      placeholder="correo@ejemplo.com"
      aria-invalid={!!errors.email}
    />
    {errors.email && (
      <p className="text-sm text-destructive flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        {errors.email.message}
      </p>
    )}
  </div>
</form>
```

### Dashboard Stats Card
```tsx
<Card className="hover:shadow-lg transition-shadow">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-primary">{count}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-7 w-7 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Referencias

- **Radix UI**: Para componentes base accesibles
- **Tailwind CSS 4.0**: Para utilidades de estilos
- **Lucide Icons**: Para iconografía consistente
- **WCAG 2.1**: Para estándares de accesibilidad

---

## Changelog

### v1.0.0 - 2026-05-04
- Definición inicial del design system
- Tokens de color basados en logo LassRiver NS
- Componentes base: Button, Input, Card, Badge
- Componentes especializados: RatingStars, StatusBadge, EmptyState
- Patrones de ondas inspirados en el logo
- Sistema de spacing y radios
