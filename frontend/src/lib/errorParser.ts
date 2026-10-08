import { UseFormSetError, FieldValues, Path } from "react-hook-form";

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Enterprise Backend Validation Error Parser
 * Maps backend 400/422 Zod errors directly onto React Hook Form fields.
 * If errors are general or no field is matched, sets root error or returns general message.
 */
export function parseAndSetApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  defaultMessage = "An unexpected error occurred. Please try again."
): string {
  if (!error || typeof error !== "object") {
    return defaultMessage;
  }

  // Handle RTK Query FetchBaseQueryError format
  const rtkError = error as { status?: number; data?: ApiErrorResponse };
  const errorData = rtkError.data;

  if (errorData) {
    // 1. If backend returned field-level validation errors array (e.g. from Zod middleware)
    if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      errorData.errors.forEach((err) => {
        if (err.field) {
          setError(err.field as Path<T>, {
            type: "server",
            message: err.message,
          });
        }
      });
      return errorData.message || "Please correct the highlighted fields.";
    }

    // 2. If backend returned a single message
    if (errorData.message) {
      setError("root" as Path<T>, {
        type: "server",
        message: errorData.message,
      });
      return errorData.message;
    }
  }

  // 3. Fallback generic error
  return defaultMessage;
}
