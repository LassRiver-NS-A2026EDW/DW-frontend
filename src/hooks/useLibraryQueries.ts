import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { booksApi, type ListBooksParams } from "../api/books";
import { favoritesApi } from "../api/favorites";
import { loansApi } from "../api/loans";
import { notificationsApi, type NotificationStatus } from "../api/notifications";
import { reservationsApi } from "../api/reservations";
import { reviewsApi } from "../api/reviews";
import {
  bookFromBackend,
  loanFromBackend,
  reservationFromBackend,
  reviewFromBackend,
} from "../api/mappers";
import { queryKeys } from "./queryKeys";

export function useBooksQuery(params: ListBooksParams) {
  return useQuery({
    queryKey: queryKeys.books(params),
    queryFn: async () => {
      const page = await booksApi.list(params);
      return {
        ...page,
        content: page.content.map(bookFromBackend),
      };
    },
  });
}

export function useBookFacetsQuery() {
  return useQuery({
    queryKey: queryKeys.bookFacets,
    queryFn: booksApi.facets,
  });
}

export function useFavoritesQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.favorites,
    enabled,
    queryFn: async () => {
      const favorites = await favoritesApi.list();
      return favorites.map((favorite) => String(favorite.bookId));
    },
    initialData: [] as string[],
  });
}

export function useLoansQuery(canManageLibrary: boolean, enabled: boolean) {
  const scope = canManageLibrary ? "all" : "mine";
  return useQuery({
    queryKey: queryKeys.loans(scope),
    enabled,
    queryFn: async () => {
      const loans = canManageLibrary ? await loansApi.listAll() : await loansApi.listMine();
      return loans.map(loanFromBackend);
    },
    initialData: [],
  });
}

export function useReservationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.reservations,
    enabled,
    queryFn: async () => {
      const reservations = await reservationsApi.listMine();
      return reservations.map(reservationFromBackend);
    },
    initialData: [],
  });
}

export function useNotificationsQuery(enabled: boolean, status: NotificationStatus = "all", page = 0, size = 10) {
  return useQuery({
    queryKey: queryKeys.notifications.list(status, page, size),
    enabled,
    queryFn: () => notificationsApi.list(status, page, size),
    refetchInterval: enabled ? 30000 : false,
  });
}

export function useUnreadNotificationsCountQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    enabled,
    queryFn: notificationsApi.unreadCount,
    refetchInterval: enabled ? 30000 : false,
    initialData: { unreadCount: 0 },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useAdminReviewsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.adminReviews,
    enabled,
    queryFn: async () => {
      const reviews = await reviewsApi.list("ALL");
      return reviews.map(reviewFromBackend);
    },
    initialData: [],
  });
}
