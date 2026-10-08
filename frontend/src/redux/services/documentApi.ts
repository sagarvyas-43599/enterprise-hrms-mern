import { baseApi } from '../api/baseApi';
import { Document } from '../../features/documents/types/document.types';

export interface GetDocumentsResponse {
  success: boolean;
  message: string;
  data: {
    documents: Document[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<GetDocumentsResponse, { page?: number; limit?: number; status?: string; employee?: string; category?: string; isMyDocuments?: boolean; search?: string }>({
      query: (params) => {
        const url = params.isMyDocuments ? '/documents/my' : '/documents';
        return {
          url,
          params: {
            page: params.page,
            limit: params.limit,
            status: params.status,
            employee: params.employee,
            category: params.category,
            search: params.search,
          },
        };
      },
      providesTags: ['Document'],
    }),
    uploadDocument: builder.mutation<{ data: Document }, Partial<Document>>({
      query: (body) => ({
        url: '/documents',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Document'],
    }),
    updateDocumentStatus: builder.mutation<{ data: Document }, { id: string; status: string; rejectionReason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/documents/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Document'],
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url: `/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useUpdateDocumentStatusMutation,
  useDeleteDocumentMutation,
} = documentApi;
