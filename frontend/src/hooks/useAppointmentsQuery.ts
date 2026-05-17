import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  AppointmentListQueryDto,
  AppointmentListResponseDto,
} from "@zdravstvo/contracts";

import { appointmentsService } from "@/services";
import type { AppApiError } from "@/types";

export const appointmentsQueryKeys = {
  all: ["appointments"] as const,
  list: (query: AppointmentListQueryDto) =>
    [...appointmentsQueryKeys.all, "list", query] as const,
};

export const useAppointmentsQuery = (
  query: AppointmentListQueryDto,
): UseQueryResult<AppointmentListResponseDto, AppApiError> => {
  return useQuery({
    queryKey: appointmentsQueryKeys.list(query),
    queryFn: () => appointmentsService.list(query),
    throwOnError: false,
  });
};
