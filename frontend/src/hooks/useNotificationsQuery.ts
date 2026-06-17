import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type {
  NotificationListQueryDto,
  NotificationListResponseDto,
  UnreadNotificationCountResponseDto,
} from "@zdravstvo/contracts";

import { notificationsService } from "@/services";
import { useAuthStore } from "@/stores";
import type { AppApiError } from "@/types";

const getNotificationScope = (): readonly [string, string | null] => {
  const { organizationId, user } = useAuthStore.getState();

  return [user?.userId ?? "anonymous", organizationId] as const;
};

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
  list: (query: NotificationListQueryDto) =>
    [...notificationsQueryKeys.all, getNotificationScope(), "list", query] as const,
  unreadCount: () =>
    [...notificationsQueryKeys.all, getNotificationScope(), "unread-count"] as const,
};

const invalidateNotifications = async (
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all }),
    queryClient.invalidateQueries({
      queryKey: notificationsQueryKeys.unreadCount(),
    }),
  ]);
};

export const useNotificationsQuery = (
  query: NotificationListQueryDto,
): UseQueryResult<NotificationListResponseDto, AppApiError> =>
  useQuery({
    queryKey: notificationsQueryKeys.list(query),
    queryFn: () => notificationsService.list(query),
    throwOnError: false,
  });

export const useUnreadNotificationCountQuery = (): UseQueryResult<
  UnreadNotificationCountResponseDto,
  AppApiError
> =>
  useQuery({
    queryKey: notificationsQueryKeys.unreadCount(),
    queryFn: () => notificationsService.unreadCount(),
    throwOnError: false,
  });

export const useMarkNotificationReadMutation = (): UseMutationResult<
  void,
  AppApiError,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => notificationsService.markRead(notificationId),
    onSuccess: () => {
      void invalidateNotifications(queryClient);
    },
  });
};

export const useMarkAllNotificationsReadMutation = (): UseMutationResult<
  void,
  AppApiError,
  void
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onMutate: () => {
      queryClient.setQueryData(notificationsQueryKeys.unreadCount(), {
        unreadCount: 0,
      });
    },
    onSuccess: () => {
      void invalidateNotifications(queryClient);
    },
    meta: { suppressToast: true },
  });
};
