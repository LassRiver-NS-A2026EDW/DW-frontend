import { useApp } from "../context/AppContext";
import { BookOpen, Star, TrendingUp, Users } from "lucide-react";
import { useBooksQuery } from "../hooks/useLibraryQueries";

const HOME_BOOKS_QUERY = {
  page: 0,
  size: 1000,
  sort: "title,asc",
};

const HOME_AVAILABLE_BOOKS_QUERY = {
  page: 0,
  size: 1,
  sort: "title,asc",
  availability: "available" as const,
};

export function Home() {
  const { books, bookCategories, currentUser, setCategoryFilter, setCurrentView, setSelectedBook } = useApp();
  const homeBooksQuery = useBooksQuery(HOME_BOOKS_QUERY);
  const availableBooksQuery = useBooksQuery(HOME_AVAILABLE_BOOKS_QUERY);

  const summaryBooks = homeBooksQuery.data?.content ?? books;
  const categories = bookCategories;
  const featuredBooks = [...summaryBooks]
    .sort((first, second) => second.rating - first.rating)
    .slice(0, 6);
  const stats = {
    totalBooks: homeBooksQuery.data?.totalElements ?? summaryBooks.length,
    availableBooks: availableBooksQuery.data?.totalElements ?? summaryBooks.filter((book) => book.available).length,
    categories: categories.length,
    avgRating:
      summaryBooks.length > 0
        ? (summaryBooks.reduce((acc, book) => acc + book.rating, 0) / summaryBooks.length).toFixed(1)
        : "0.0",
  };

  const openBook = (book: (typeof summaryBooks)[number]) => {
    setSelectedBook(book);
    setCurrentView("book-detail");
  };

  const openCategory = (category: string) => {
    setCategoryFilter(category);
    setCurrentView("catalog");
  };

  const statItems = [
    { label: "Titulos", value: stats.totalBooks, icon: BookOpen, color: "var(--primary)" },
    { label: "Rating", value: stats.avgRating, icon: Star, color: "#f59e0b" },
    { label: "Categorias", value: stats.categories, icon: Users, color: "var(--accent)" },
    { label: "Disponibles", value: stats.availableBooks, icon: TrendingUp, color: "var(--river-cyan)" },
  ];

  return (
    <div className="flex-1 overflow-auto custom-scroll mesh-bg min-h-screen transition-colors duration-500">
      <section className="relative pt-24 pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 animate-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3">
              <span className="h-px w-12 bg-primary" />
              <span className="text-primary uppercase tracking-[0.4em] text-[10px] font-black">LassRiver NS</span>
            </div>

            <h1 className="text-7xl lg:text-9xl font-black tracking-tighter text-reveal leading-[0.85]">
              Lee el <br />
              <span className="text-primary italic">Futuro.</span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-lg leading-relaxed font-light">
              No es solo una biblioteca. Es un ecosistema digital disenado para la nueva era de la literatura.{" "}
              <span className="text-foreground font-medium">Contenido curado, experiencia inmersiva.</span>
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <button
                onClick={() => setCurrentView("catalog")}
                className="group h-16 px-10 bg-primary text-primary-foreground font-bold rounded-full flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(24,152,168,0.4)]"
              >
                <span>Comenzar Lectura</span>
                <TrendingUp className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {!currentUser && (
                <button
                  onClick={() => setCurrentView("register")}
                  className="h-16 px-10 rounded-full border border-border text-foreground font-bold hover:bg-accent/10 transition-all backdrop-blur-md"
                >
                  Registrarse
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4 animate-in" style={{ animationDelay: "0.3s" }}>
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="glass-stat p-8 rounded-[2.5rem] flex flex-col justify-between aspect-square">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center"
                    style={{ background: `${item.color}10`, color: item.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-foreground tracking-tighter mb-1">{item.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{item.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <section className="animate-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl font-black text-foreground tracking-tighter italic">Seleccion Editorial</h2>
              <div className="h-1 w-20 bg-accent mt-4" />
            </div>
            <button
              onClick={() => setCurrentView("catalog")}
              className="text-xs font-black tracking-widest text-primary hover:text-accent transition-colors"
            >
              EXPLORAR TODO
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-16">
            {featuredBooks.map((book) => (
              <button key={book.id} className="group cursor-pointer text-left" onClick={() => openBook(book)}>
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-primary/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative aspect-[2/3] rounded-[1.8rem] overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-translate-y-4">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <span className="text-white text-[10px] font-bold tracking-widest uppercase">Ver Detalles</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-foreground font-black text-sm mb-1 line-clamp-1 tracking-tight">{book.title}</h3>
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold line-clamp-1">{book.author}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-32 p-12 rounded-[3rem] bg-card border border-border animate-in" style={{ animationDelay: "0.6s" }}>
          <h3 className="text-lg font-bold text-foreground mb-8 flex items-center gap-4">
            <Users className="h-5 w-5 text-accent" />
            Explorar por Categoria
          </h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => openCategory(category)}
                className="px-8 py-3 rounded-full bg-card border border-border text-muted-foreground text-xs font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                {category}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
