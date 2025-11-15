import { useQuery } from '@tanstack/react-query'
import { getPersonById } from '../actions'

export const useGetPersonById = (id, options = {}) => {
    return useQuery({
        queryKey: ['person', id],
        queryFn: () => getPersonById(id),
        enabled: !!id,
        ...options
    })
}

