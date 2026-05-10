import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { AppointmentTypeDto } from "@zdravstvo/contracts";

import { appointmentTypesService } from "@/services";
import type { AppApiError } from "@/types";

export const appointmentTypesQueryKeys = {
  all: ["appointment-types"] as const,
  list: () => [...appointmentTypesQueryKeys.all, "list"] as const,
};

export const useAppointmentTypesQuery = (): UseQueryResult<
  AppointmentTypeDto[],
  AppApiError
> => {
  return useQuery({
    queryKey: appointmentTypesQueryKeys.list(),
    queryFn: () => appointmentTypesService.list(),
    throwOnError: false,
  });
};
