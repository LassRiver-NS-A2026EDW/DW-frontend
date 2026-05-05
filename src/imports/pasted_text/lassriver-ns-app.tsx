Crea una aplicación web funcional, no un mockup estático, para una plataforma de biblioteca digital llamada “LassRiver NS”.

Resolución principal del diseño: 1920x1080 desktop.
Estilo visual: moderno, minimalista, premium, limpio, fluido, con estética tecnológica inspirada en un río digital, usando la paleta del logotipo LassRiver NS:
- Primary Navy #182858
- Deep Blue #183868
- River Cyan #1898A8
- Aqua Blue #1888A8
- Leaf Green #68B848
- Fresh Green #78B848
- Dark Background #07111F
- Surface #0E1A2F
- Light Surface #F7FAFC

No quiero una imagen plana ni un wireframe. Quiero una GUI avanzada con componentes reales, estados interactivos, navegación simulada, formularios funcionales, validaciones visuales, tablas, filtros, modales, drawers, toasts, estados vacíos, loading skeletons y dashboards.

Tecnología visual esperada:
- React + TypeScript.
- Tailwind CSS.
- Componentes inspirados en librerías modernas de libre uso como shadcn/ui, Radix UI, lucide-react, TanStack Table y componentes estilo dashboard SaaS.
- Diseño basado en componentes reutilizables: Button, Input, Card, Dialog, Sheet, Tabs, Badge, Avatar, Table, Dropdown, Command/Search, Toast, Select, Checkbox, Pagination, Rating Stars.
- Íconos minimalistas tipo lucide-react.
- Tipografía moderna tipo Inter.
- Layout con sidebar colapsable, topbar, breadcrumbs, command search global, avatar de usuario, notificaciones y switch de tema claro/oscuro.

La app debe cubrir estas historias de usuario funcionales:
1. Registro de usuario.
2. Inicio de sesión.
3. Cierre de sesión.
4. Edición de perfil.
5. Listado de catálogo de libros.
6. Búsqueda por título o autor.
7. Filtros por categoría e idioma.
8. Detalle de libro.
9. Agregar/quitar favoritos.
10. Listar favoritos.
11. Crear reseña/calificación.
12. Editar/eliminar reseña propia.
13. Crear libros como administrador.
14. Editar/desactivar libros como administrador.
15. Gestionar préstamos en panel administrativo.
16. Moderar reseñas.
17. Representar seguridad JWT en la experiencia de sesión.
18. Control por roles: usuario, bibliotecario y administrador.

Estructura de pantallas:
- Landing / Home pública.
- Login.
- Registro.
- Catálogo público.
- Detalle de libro.
- Favoritos del usuario.
- Perfil y preferencias.
- Panel usuario.
- Panel administrador.
- Gestión de libros.
- Crear/editar libro.
- Gestión de préstamos.
- Moderación de reseñas.
- Página de error 401/403.
- Estado vacío del catálogo.
- Estado de carga con skeletons.
- Estado de error amigable.

Diseña la pantalla principal 1920x1080 como un dashboard avanzado:
- Sidebar izquierda con logo LassRiver NS, navegación: Inicio, Catálogo, Favoritos, Reseñas, Perfil, Administración.
- Topbar con buscador global, filtros rápidos, botón de tema, campana de notificaciones y avatar.
- Área principal con título “Explorar biblioteca”.
- Barra de búsqueda por título o autor.
- Filtros combinables por categoría, idioma, rating y disponibilidad.
- Grid de tarjetas de libros con portada, título, autor, categoría, idioma, rating promedio, disponibilidad y botón de favorito.
- Panel derecho contextual con “Lecturas destacadas”, “Favoritos recientes”, “Actividad” y recomendaciones.
- Estados de interacción: hover, active, focus, disabled, selected.
- Paginación visible.
- Toast cuando se agrega o elimina un favorito.

Detalle de libro:
- Layout de ficha avanzada con portada grande, metadata completa, ISBN, editorial, fecha, páginas, categoría, idioma, disponibilidad, rating promedio.
- Botones: Agregar a favoritos, Reservar/Prestar, Escribir reseña.
- Sección de reseñas con rating de 1 a 5 estrellas.
- Formulario de reseña con límite visual de 500 caracteres.
- Si el usuario no está autenticado, mostrar llamada a iniciar sesión.

Panel administrador:
- Dashboard con métricas: libros activos, usuarios, préstamos activos, préstamos vencidos, reseñas pendientes de moderación.
- Tabla avanzada de libros con búsqueda, filtros, acciones por fila: editar, desactivar, activar.
- Formulario de creación/edición de libro con validaciones: título obligatorio, autor obligatorio, ISBN con formato válido, editorial, categoría, idioma, portada, descripción.
- Gestión de préstamos con tabs: activos, vencidos, devueltos.
- Tabla de préstamos con estado visual usando badges.
- Historial de operaciones auditables con timestamp, usuario y acción.
- Moderación de reseñas con lista de reseñas marcadas, razón de marcado, botón ocultar, botón mantener visible y confirmación modal.

Autenticación y roles:
- Login con validación visual de email y contraseña.
- Registro con validación de nombre, email, contraseña mínima de 8 caracteres y mensaje de email duplicado.
- Estado autenticado con perfil mínimo: id, nombre, rol.
- Rutas protegidas simuladas.
- Pantalla 401 si no hay sesión.
- Pantalla 403 si el rol no tiene permiso.
- Mostrar distinta navegación según rol: visitante, usuario, bibliotecario, administrador.

Requisitos de UX:
- Debe sentirse como producto real listo para desarrollo.
- No usar Lorem Ipsum; usar contenido realista en español.
- Microcopy claro y profesional.
- Accesibilidad WCAG AA: buen contraste, labels, focus states visibles, tamaños legibles.
- Diseño responsive, aunque el frame principal sea 1920x1080.
- Animaciones sutiles: transiciones suaves, hover, drawer, dialog, skeleton loading.
- Usa glassmorphism muy sutil solo en paneles destacados, sin abusar.
- Mantén una estética limpia, no saturada.

Datos de ejemplo:
Crea al menos 12 libros con títulos, autores, categorías, idiomas, ratings y estados de disponibilidad.
Incluye ejemplos de reseñas, usuarios y préstamos.
Incluye al menos tres roles:
- Usuario: Daniel Lasso
- Bibliotecaria: Ana Rivera
- Administrador: Admin LassRiver

Resultado esperado:
Genera una app React funcional/prototipo navegable con componentes modernos, diseño visual avanzado, estados interactivos, navegación entre pantallas y estructura preparada para conectar con backend REST/JWT.