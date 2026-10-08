import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { setCredentials, logout } from "../slices/authSlice";

interface AuthStoreState {
  auth?: {
    accessToken?: string | null;
    refreshToken?: string | null;
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // 1. First check Redux state
    const token =
      (getState() as AuthStoreState).auth?.accessToken ||
      Cookies.get("hrms_access_token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

/**
 * Enterprise Re-authentication Base Query
 * Automatically intercepts HTTP 401 errors, calls /auth/refresh-token,
 * updates credentials, and transparently retries the failed query/mutation.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken =
      (api.getState() as AuthStoreState).auth?.refreshToken ||
      Cookies.get("hrms_refresh_token");

    if (refreshToken) {
      // Attempt refreshing token
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh-token",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as {
          success: boolean;
          data: { accessToken: string };
        };

        const newAccessToken = data.data.accessToken;

        // Store new access token
        api.dispatch(
          setCredentials({
            accessToken: newAccessToken,
            refreshToken,
          })
        );
        Cookies.set("hrms_access_token", newAccessToken, { expires: 1 });

        // Retry original query with fresh token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh token expired or revoked - log out user
        api.dispatch(logout());
        Cookies.remove("hrms_access_token");
        Cookies.remove("hrms_refresh_token");
      }
    } else {
      api.dispatch(logout());
      Cookies.remove("hrms_access_token");
      Cookies.remove("hrms_refresh_token");
    }
  }

  return result;
};

/**
 * Centralized Enterprise RTK Query Base API
 * Micro-services inject their endpoints into this base API via api.injectEndpoints
 */
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Employee",
    "Attendance",
    "Leave",
    "Payroll",
    "Asset",
    "Ticket",
    "Performance",
    "Department",
    "Designation",
    "Policy",
    "AuditLog",
    "Report",
    "Setting",
    "Notification",
    "Recruitment",
    "Expense",
    "Document",
  ],
  endpoints: () => ({}),
});
