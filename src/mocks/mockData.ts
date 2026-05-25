export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  language: string;
  publisher: string;
  publishDate: string;
  pages: number;
  description: string;
  coverUrl: string;
  rating: number;
  available: boolean;
  reviewCount: number;
  hasPdf?: boolean;
  pdfUrl?: string | null;
  isReservedByMe?: boolean;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  flagged: boolean;
  flagReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "librarian" | "admin";
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: "active" | "overdue" | "returned";
}

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "Cien Años de Soledad",
    author: "Gabriel García Márquez",
    isbn: "978-0307474728",
    category: "Ficción",
    language: "Español",
    publisher: "Editorial Sudamericana",
    publishDate: "1967-05-30",
    pages: 417,
    description: "Una obra maestra del realismo mágico que narra la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop",
    rating: 4.8,
    available: true,
    reviewCount: 156,
  },
  {
    id: "2",
    title: "El Amor en los Tiempos del Cólera",
    author: "Gabriel García Márquez",
    isbn: "978-0307389732",
    category: "Romance",
    language: "Español",
    publisher: "Oveja Negra",
    publishDate: "1985-09-05",
    pages: 368,
    description: "Una historia de amor que trasciende el tiempo, contada con la maestría característica de García Márquez.",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop",
    rating: 4.6,
    available: true,
    reviewCount: 98,
  },
  {
    id: "3",
    title: "Don Quijote de la Mancha",
    author: "Miguel de Cervantes",
    isbn: "978-8420412146",
    category: "Clásicos",
    language: "Español",
    publisher: "Real Academia Española",
    publishDate: "1605-01-16",
    pages: 863,
    description: "La obra cumbre de la literatura española que narra las aventuras del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop",
    rating: 4.9,
    available: false,
    reviewCount: 234,
  },
  {
    id: "4",
    title: "La Sombra del Viento",
    author: "Carlos Ruiz Zafón",
    isbn: "978-0143126393",
    category: "Misterio",
    language: "Español",
    publisher: "Planeta",
    publishDate: "2001-04-17",
    pages: 487,
    description: "Un joven descubre un libro maldito que cambiará su vida para siempre en la Barcelona de posguerra.",
    coverUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=450&fit=crop",
    rating: 4.7,
    available: true,
    reviewCount: 189,
  },
  {
    id: "5",
    title: "Rayuela",
    author: "Julio Cortázar",
    isbn: "978-8420471778",
    category: "Ficción",
    language: "Español",
    publisher: "Alfaguara",
    publishDate: "1963-06-28",
    pages: 600,
    description: "Una novela experimental que puede leerse de múltiples formas, explorando la vida de Horacio Oliveira entre París y Buenos Aires.",
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=450&fit=crop",
    rating: 4.5,
    available: true,
    reviewCount: 112,
  },
  {
    id: "6",
    title: "La Casa de los Espíritus",
    author: "Isabel Allende",
    isbn: "978-1501117015",
    category: "Ficción",
    language: "Español",
    publisher: "Plaza & Janés",
    publishDate: "1982-10-01",
    pages: 433,
    description: "La saga de la familia Trueba a través de cuatro generaciones en un país latinoamericano innominado.",
    coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop",
    rating: 4.6,
    available: true,
    reviewCount: 145,
  },
  {
    id: "7",
    title: "Ficciones",
    author: "Jorge Luis Borges",
    isbn: "978-0802130303",
    category: "Cuentos",
    language: "Español",
    publisher: "Emecé",
    publishDate: "1944-01-01",
    pages: 174,
    description: "Colección de cuentos que exploran temas como el tiempo, el infinito, los espejos y los laberintos.",
    coverUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=450&fit=crop",
    rating: 4.8,
    available: false,
    reviewCount: 167,
  },
  {
    id: "8",
    title: "Pedro Páramo",
    author: "Juan Rulfo",
    isbn: "978-0802133908",
    category: "Ficción",
    language: "Español",
    publisher: "Fondo de Cultura Económica",
    publishDate: "1955-03-19",
    pages: 124,
    description: "Una novela corta que narra el regreso de Juan Preciado al pueblo fantasmal de Comala en busca de su padre.",
    coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop",
    rating: 4.7,
    available: true,
    reviewCount: 134,
  },
  {
    id: "9",
    title: "El Túnel",
    author: "Ernesto Sabato",
    isbn: "978-8432217036",
    category: "Ficción Psicológica",
    language: "Español",
    publisher: "Seix Barral",
    publishDate: "1948-01-01",
    pages: 158,
    description: "La confesión de un pintor sobre el asesinato de la única mujer que creyó comprenderlo.",
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=450&fit=crop",
    rating: 4.4,
    available: true,
    reviewCount: 87,
  },
  {
    id: "10",
    title: "Los Detectives Salvajes",
    author: "Roberto Bolaño",
    isbn: "978-0374191481",
    category: "Ficción",
    language: "Español",
    publisher: "Anagrama",
    publishDate: "1998-01-01",
    pages: 609,
    description: "Una novela que sigue a un grupo de poetas en su búsqueda de una poetisa perdida en el desierto de Sonora.",
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop",
    rating: 4.5,
    available: true,
    reviewCount: 121,
  },
  {
    id: "11",
    title: "Crónica de una Muerte Anunciada",
    author: "Gabriel García Márquez",
    isbn: "978-0307475084",
    category: "Ficción",
    language: "Español",
    publisher: "Editorial Sudamericana",
    publishDate: "1981-04-01",
    pages: 122,
    description: "La reconstrucción de un asesinato anunciado que todo el pueblo conocía pero nadie pudo evitar.",
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=450&fit=crop",
    rating: 4.6,
    available: true,
    reviewCount: 143,
  },
  {
    id: "12",
    title: "La Ciudad y los Perros",
    author: "Mario Vargas Llosa",
    isbn: "978-8420412580",
    category: "Ficción",
    language: "Español",
    publisher: "Alfaguara",
    publishDate: "1963-10-01",
    pages: 408,
    description: "Una novela ambientada en un colegio militar de Lima que explora temas de violencia, corrupción y lealtad.",
    coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=450&fit=crop",
    rating: 4.5,
    available: false,
    reviewCount: 156,
  },
];

export const mockReviews: Review[] = [
  {
    id: "r1",
    bookId: "1",
    userId: "u1",
    userName: "Daniel Lasso",
    rating: 5,
    comment: "Una obra maestra absoluta. La narrativa de García Márquez es hipnotizante y la historia de los Buendía es inolvidable.",
    date: "2026-04-15",
    flagged: false,
  },
  {
    id: "r2",
    bookId: "1",
    userId: "u2",
    userName: "Ana Rivera",
    rating: 5,
    comment: "El realismo mágico en su máxima expresión. Cada página es un descubrimiento.",
    date: "2026-04-20",
    flagged: false,
  },
  {
    id: "r3",
    bookId: "2",
    userId: "u1",
    userName: "Daniel Lasso",
    rating: 4,
    comment: "Una historia de amor épica y conmovedora. García Márquez demuestra su maestría narrativa una vez más.",
    date: "2026-04-10",
    flagged: false,
  },
  {
    id: "r4",
    bookId: "4",
    userId: "u3",
    userName: "María González",
    rating: 5,
    comment: "Zafón crea un universo literario fascinante en la Barcelona de posguerra. Absolutamente cautivador.",
    date: "2026-04-25",
    flagged: false,
  },
  {
    id: "r5",
    bookId: "3",
    userId: "u1",
    userName: "Daniel Lasso",
    rating: 5,
    comment: "El clásico por excelencia de la literatura española. Una lectura obligatoria.",
    date: "2026-03-30",
    flagged: false,
  },
  {
    id: "r6",
    bookId: "7",
    userId: "u4",
    userName: "Carlos Mendoza",
    rating: 3,
    comment: "Contenido inapropiado que debería ser revisado.",
    date: "2026-04-28",
    flagged: true,
    flagReason: "Comentario ofensivo",
  },
];

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Daniel Lasso",
    email: "daniel.lasso@lassriver.com",
    role: "user",
  },
  {
    id: "u2",
    name: "Ana Rivera",
    email: "ana.rivera@lassriver.com",
    role: "librarian",
  },
  {
    id: "u3",
    name: "Admin LassRiver",
    email: "admin@lassriver.com",
    role: "admin",
  },
];

export const mockLoans: Loan[] = [
  {
    id: "l1",
    bookId: "3",
    bookTitle: "Don Quijote de la Mancha",
    userId: "u1",
    userName: "Daniel Lasso",
    loanDate: "2026-04-15",
    dueDate: "2026-05-15",
    status: "active",
  },
  {
    id: "l2",
    bookId: "7",
    bookTitle: "Ficciones",
    userId: "u1",
    userName: "Daniel Lasso",
    loanDate: "2026-04-01",
    dueDate: "2026-04-25",
    status: "overdue",
  },
  {
    id: "l3",
    bookId: "12",
    bookTitle: "La Ciudad y los Perros",
    userId: "u2",
    userName: "Ana Rivera",
    loanDate: "2026-04-20",
    dueDate: "2026-05-20",
    status: "active",
  },
  {
    id: "l4",
    bookId: "1",
    bookTitle: "Cien Años de Soledad",
    userId: "u1",
    userName: "Daniel Lasso",
    loanDate: "2026-03-15",
    dueDate: "2026-04-15",
    returnDate: "2026-04-14",
    status: "returned",
  },
];
