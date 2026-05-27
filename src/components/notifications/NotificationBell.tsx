import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Inbox, LoaderCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
} from "../../hooks/useLibraryQueries";
import type { NotificationResponse } from "../../api/notifications";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

const NAVIGABLE_VIEWS = new Set(["loans", "reservations", "catalog", "profile"]);

export function NotificationBell() {
  const { currentUser, setCurrentView } = useApp();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const enabled = Boolean(currentUser);

  const unreadCountQuery = useUnreadNotificationsCountQuery(enabled);
  const notificationsQuery = useNotificationsQuery(enabled && open, "all", 0, 10);
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const notifications = notificationsQuery.data?.content ?? [];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  if (!currentUser) {
    return null;
  }

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.readAt) {
      await markReadMutation.mutateAsync(notification.id);
    }

    if (notification.targetView && NAVIGABLE_VIEWS.has(notification.targetView)) {
      setCurrentView(notification.targetView);
      setOpen(false);
    }
  };

  const handleMarkAll = async () => {
    await markAllReadMutation.mutateAsync();
  };

  return (
    <div className="relative" ref={rootRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((current) => !current)}
        className="relative transition-transform duration-200 hover:scale-110"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-destructive px-1.5 text-[11px] leading-5 text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold leading-tight">Notificaciones</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount === 1 ? "1 sin leer" : `${unreadCount} sin leer`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAll}
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              className="h-8 px-2 text-xs"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scroll">
            {notificationsQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Cargando notificaciones
              </div>
            ) : notificationsQuery.isError ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No se pudieron cargar las notificaciones.
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
                <Inbox className="h-5 w-5" />
                No tienes notificaciones.
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  disabled={markReadMutation.isPending}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  disabled,
  onClick,
}: {
  notification: NotificationResponse;
  disabled: boolean;
  onClick: () => void;
}) {
  const unread = !notification.readAt;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid w-full grid-cols-[auto,1fr] gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/10 disabled:cursor-wait disabled:opacity-70",
        unread && "bg-primary/5",
      )}
    >
      <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", unread ? "bg-primary" : "bg-transparent")} />
      <span className="min-w-0">
        <span className="flex items-start justify-between gap-2">
          <span className="line-clamp-1 text-sm font-semibold text-foreground">{notification.title}</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatNotificationDate(notification.createdAt)}
          </span>
        </span>
        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
          {notification.message}
        </span>
      </span>
    </button>
  );
}

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
