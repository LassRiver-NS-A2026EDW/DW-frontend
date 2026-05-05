import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { BookOpen, Users, Star, TrendingUp } from "lucide-react";

export function Home() {
  const { books, currentUser, setCurrentView } = useApp();

  const featuredBooks = books.filter((b) => b.rating >= 4.7).slice(0, 6);
  const recentBooks = books.slice(0, 6);
  const stats = {
    totalBooks: books.length,
    availableBooks: books.filter((b) => b.available).length,
    categories: new Set(books.map((b) => b.category)).size,
    avgRating: (books.reduce((acc, b) => acc + b.rating, 0) / books.length).toFixed(1),
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="relative h-96 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Patrón de ondas en el hero */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-waves" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M0 100 Q 50 50, 100 100 T 200 100" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M0 120 Q 50 70, 100 120 T 200 120" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M0 140 Q 50 90, 100 140 T 200 140" stroke="white" strokeWidth="1.5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-waves)" />
          </svg>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <img src="figma:asset/imagen.png" alt="LassRiver NS" className="h-24 mx-auto mb-8 drop-shadow-2xl" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Bienvenido a LassRiver NS</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95 drop-shadow">
            Tu biblioteca digital premium con la mejor colección de literatura en español
          </p>
          {!currentUser ? (
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => setCurrentView("login")}>
                Iniciar Sesión
              </Button>
              <Button size="lg" variant="outline" onClick={() => setCurrentView("register")} className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                Registrarse
              </Button>
            </div>
          ) : (
            <Button size="lg" variant="secondary" onClick={() => setCurrentView("catalog")}>
              Explorar Catálogo
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
                <p className="text-sm text-muted-foreground">Libros Totales</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.availableBooks}</p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.categories}</p>
                <p className="text-sm text-muted-foreground">Categorías</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgRating}</p>
                <p className="text-sm text-muted-foreground">Rating Promedio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Libros Destacados</h2>
            <Button variant="ghost" onClick={() => setCurrentView("catalog")}>
              Ver todos
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {featuredBooks.map((book) => (
              <Card
                key={book.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setCurrentView("catalog")}
              >
                <div className="aspect-[3/4] bg-muted">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">{book.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{book.rating.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Categorías Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(books.map((b) => b.category))).map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    setCurrentView("catalog");
                  }}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
