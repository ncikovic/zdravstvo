import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { DoctorResponseDto } from "@zdravstvo/contracts";

import { doctorsService } from "@/services";
import type { AppApiError } from "@/types";

export const doctorsQueryKeys = {
  all: ["doctors"] as const,
  list: () => [...doctorsQueryKeys.all, "list"] as const,
};

export const useDoctorsQuery = (): UseQueryResult<
  DoctorResponseDto[],
  AppApiError
> => {
  return useQuery({
    queryKey: doctorsQueryKeys.list(),
    queryFn: () => doctorsService.list().then((r) => r.doctors),
    throwOnError: false,
  });
};
