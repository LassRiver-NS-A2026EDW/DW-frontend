import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  MessageSquare,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { booksApi } from "../api/books";
import { getAuthToken } from "../api/http";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { ChatPanel } from "../components/chat/ChatPanel";
import { EmptyState } from "../components/EmptyState";
import { useApp } from "../context/AppContext";

const PDFJS_MODULE_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs";
const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

export function BookReader() {
  const { selectedBook, currentUser, downloadBookPdf, setSelectedBook, setCurrentView } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  const [pdfJs, setPdfJs] = useState<any>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pageRendering, setPageRendering] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [chatOpen, setChatOpen] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [loadPdfOpen, setLoadPdfOpen] = useState(false);
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [savingPdfUrl, setSavingPdfUrl] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const isPrivileged = currentUser?.role === "admin" || currentUser?.role === "librarian";

  useEffect(() => {
    const handler = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";
      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !viewerRef.current?.contains(anchorNode)) return;
      if (text.length > 5) {
        setSelectedText(text.slice(0, 6000));
      }
    };
    document.addEventListener("mouseup", handler);
    return () => document.removeEventListener("mouseup", handler);
  }, []);

  useEffect(() => {
    if (!selectedBook?.id || !currentUser) return;
    const controller = new AbortController();
    let loadingTask: any;

    async function loadPdf() {
      setPdfLoading(true);
      setPageRendering(false);
      setPdfError(null);
      setPdfDocument(null);
      setTotalPages(0);
      setPage(1);
      setSelectedText("");

      try {
        const pdfjs = await import(/* @vite-ignore */ PDFJS_MODULE_URL);
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        setPdfJs(pdfjs);

        const token = getAuthToken();
        const response = await fetch(booksApi.pdfUrl(selectedBook!.id), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!response.ok) {
          if (response.status === 403) throw new Error("Necesitas un prestamo activo para leer este libro.");
          if (response.status === 404) throw new Error("PDF no encontrado en el servidor.");
          throw new Error("No se pudo cargar el PDF.");
        }

        const data = await response.arrayBuffer();
        loadingTask = pdfjs.getDocument({ data });
        const document = await loadingTask.promise;
        setPdfDocument(document);
        setTotalPages(document.numPages);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setPdfError(err?.message || "Error al cargar el PDF.");
        }
      } finally {
        setPdfLoading(false);
      }
    }

    loadPdf();
    return () => {
      controller.abort();
      loadingTask?.destroy?.();
    };
  }, [selectedBook?.id, currentUser?.id, reloadKey]);

  useEffect(() => {
    if (!pdfDocument || !pdfJs || !canvasRef.current || !textLayerRef.current) return;

    let cancelled = false;
    let renderTask: any;

    async function renderPage() {
      setPageRendering(true);
      setPdfError(null);

      try {
        const pdfPage = await pdfDocument.getPage(page);
        if (cancelled) return;

        const viewport = pdfPage.getViewport({ scale: zoom });
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");
        const outputScale = window.devicePixelRatio || 1;

        if (!context) throw new Error("No se pudo preparar el lector PDF.");

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
        context.clearRect(0, 0, viewport.width, viewport.height);

        const textContentPromise = pdfPage.getTextContent();
        renderTask = pdfPage.render({ canvasContext: context, viewport });
        await renderTask.promise;
        const textContent = await textContentPromise;
        if (cancelled) return;

        renderTextLayer(pdfJs, textContent, viewport);
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          setPdfError(err?.message || "No se pudo renderizar esta pagina.");
        }
      } finally {
        if (!cancelled) setPageRendering(false);
      }
    }

    renderPage();
    return () => {
      cancelled = true;
      renderTask?.cancel?.();
    };
  }, [pdfDocument, pdfJs, page, zoom]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (!selectedBook) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={FileText}
          title="Libro no seleccionado"
          description="Vuelve al catalogo y selecciona un libro para leer."
          actionLabel="Volver al catalogo"
          onAction={() => setCurrentView("catalog")}
        />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={FileText}
          title="Inicia sesion para leer"
          description="Necesitas una sesion activa y un prestamo vigente para abrir este PDF."
          actionLabel="Iniciar sesion"
          onAction={() => setCurrentView("login")}
        />
      </div>
    );
  }

  function renderTextLayer(pdfjs: any, textContent: any, viewport: any) {
    const layer = textLayerRef.current;
    if (!layer) return;

    layer.innerHTML = "";
    layer.style.width = `${viewport.width}px`;
    layer.style.height = `${viewport.height}px`;

    for (const item of textContent.items ?? []) {
      if (!item?.str) continue;
      const tx = pdfjs.Util.transform(viewport.transform, item.transform);
      const angle = Math.atan2(tx[1], tx[0]);
      const fontHeight = Math.hypot(tx[2], tx[3]) || 12;
      const span = document.createElement("span");

      span.textContent = item.str;
      span.style.position = "absolute";
      span.style.left = `${tx[4]}px`;
      span.style.top = `${tx[5] - fontHeight}px`;
      span.style.fontSize = `${fontHeight}px`;
      span.style.fontFamily = "sans-serif";
      span.style.whiteSpace = "pre";
      span.style.color = "transparent";
      span.style.cursor = "text";
      span.style.userSelect = "text";
      span.style.transformOrigin = "0 0";
      span.style.transform = `rotate(${angle}rad)`;
      layer.appendChild(span);
    }
  }

  const goBack = () => {
    setSelectedBook(selectedBook);
    setCurrentView("book-detail");
  };

  const submitPdfUrl = async () => {
    const url = pdfUrlInput.trim();
    if (!url) return;
    setSavingPdfUrl(true);
    try {
      await downloadBookPdf(selectedBook.id, url);
      toast.success("PDF asociado correctamente");
      setLoadPdfOpen(false);
      setPdfUrlInput("");
      setReloadKey((current) => current + 1);
    } catch (err: any) {
      toast.error(err?.message || "No se pudo asociar el PDF");
    } finally {
      setSavingPdfUrl(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-background">
      <div className="min-h-[3.25rem] shrink-0 border-b border-border bg-card px-4 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="min-w-0 flex-1 text-center">
          <h1 className="text-sm font-bold truncate">{selectedBook.title}</h1>
          <p className="text-xs text-muted-foreground truncate">{selectedBook.author}</p>
        </div>

        <div className="flex items-center gap-2">
          {isPrivileged && (
            <Button variant="outline" size="sm" onClick={() => setLoadPdfOpen(true)}>
              <Download className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Cargar PDF</span>
            </Button>
          )}
          <Button variant={chatOpen ? "default" : "outline"} size="sm" onClick={() => setChatOpen((v) => !v)}>
            <MessageSquare className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Chat IA</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border bg-card px-4 py-2 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={page <= 1 || !totalPages} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-16 text-center text-sm">
                <span className="font-semibold">{page}</span>
                <span className="text-muted-foreground"> / {totalPages || "-"}</span>
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={!totalPages || page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages || p, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={zoom <= 0.4} onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>
                {Math.round(zoom * 100)}%
              </Button>
              <Button variant="outline" size="icon" disabled={zoom >= 3} onClick={() => setZoom((z) => Math.min(3, z + 0.2))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setReloadKey((current) => current + 1)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {selectedText && (
              <span className="text-xs text-primary border border-primary/30 rounded-full px-3 py-1">
                Texto seleccionado
              </span>
            )}
          </div>

          <div ref={viewerRef} className="flex-1 min-h-0 overflow-auto custom-scroll bg-[#525659] p-4">
            {(pdfLoading || pageRendering) && !pdfError && (
              <div className="sticky top-4 z-10 mx-auto mb-4 w-fit rounded-full bg-background/90 px-4 py-2 text-sm text-muted-foreground shadow">
                {pdfLoading ? "Cargando PDF..." : "Renderizando pagina..."}
              </div>
            )}
            {pdfError && (
              <div className="h-full flex items-center justify-center p-6">
                <EmptyState
                  icon={FileText}
                  title="No se pudo abrir el PDF"
                  description={pdfError}
                  actionLabel="Volver al libro"
                  onAction={goBack}
                />
              </div>
            )}
            {!pdfError && (
              <div className="relative mx-auto w-fit shadow-2xl">
                <canvas ref={canvasRef} className="block bg-white" />
                <div
                  ref={textLayerRef}
                  className="absolute inset-0 overflow-hidden"
                  style={{ userSelect: "text" }}
                  onMouseUp={() => {
                    const text = window.getSelection()?.toString().trim() ?? "";
                    if (text.length > 5) setSelectedText(text.slice(0, 6000));
                  }}
                />
              </div>
            )}
          </div>
        </main>

        {chatOpen && (
          <div className="fixed md:static right-0 top-[3.25rem] bottom-0 z-40 w-[90vw] max-w-[380px] md:w-[22rem] md:max-w-none md:min-w-[320px] border-l border-border bg-background">
            <ChatPanel
              bookId={selectedBook.id}
              bookDescription={selectedBook.description}
              selectedText={selectedText}
              onClearSelectedText={() => setSelectedText("")}
              onClose={() => setChatOpen(false)}
            />
          </div>
        )}
      </div>

      <Dialog open={loadPdfOpen} onOpenChange={setLoadPdfOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargar PDF desde URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="url"
              value={pdfUrlInput}
              onChange={(event) => setPdfUrlInput(event.target.value)}
              placeholder="https://ejemplo.com/libro.pdf"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLoadPdfOpen(false)} disabled={savingPdfUrl}>
                Cancelar
              </Button>
              <Button onClick={submitPdfUrl} disabled={!pdfUrlInput.trim() || savingPdfUrl}>
                {savingPdfUrl ? "Descargando..." : "Cargar PDF"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
