import { MutationCache, QueryClient } from '@tanstack/react-query'

import { toast } from '@/utils/toast'

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.meta?.suppressToast) return
      toast.error(error)
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      throwOnError: true,
    },
    mutations: {
      throwOnError: false,
    },
  },
})
