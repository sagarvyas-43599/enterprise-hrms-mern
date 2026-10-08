import { baseApi } from "../api/baseApi";
import { setCredentials, setUser, logout } from "../slices/authSlice";
import {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  AuthUser,
} from "../../features/auth/types/auth.types";
import Cookies from "js-cookie";

export interface MeResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Corporate Login
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const backendData = data.data;

          const accessToken =
            backendData.tokens?.accessToken || (backendData as any).accessToken;
          const refreshToken =
            backendData.tokens?.refreshToken || (backendData as any).refreshToken;

          const user: AuthUser = {
            id: backendData.user?.id || (backendData.user as any)?._id,
            email: backendData.user?.email,
            role: backendData.user?.role,
            employeeId: backendData.employee?.id || (backendData.employee as any)?._id,
            empId: backendData.employee?.empId,
            firstName: backendData.employee?.firstName,
            lastName: backendData.employee?.lastName,
            department: backendData.employee?.department,
            designation: backendData.employee?.designation,
            profileImage: backendData.employee?.profileImage,
            phone: backendData.employee?.phone,
            joinedAt: backendData.employee?.joinedAt,
          };

          if (accessToken) {
            Cookies.set("hrms_access_token", accessToken, { expires: 1 });
          }
          if (refreshToken) {
            Cookies.set("hrms_refresh_token", refreshToken, { expires: 7 });
          }

          dispatch(
            setCredentials({
              accessToken,
              refreshToken,
              user,
            })
          );
        } catch {
          // Handled in caller component
        }
      },
      invalidatesTags: ["Auth"],
    }),

    // 2. User & Employee Registration
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Employee"],
    }),

    // 3. Current Authenticated Profile
    getMe: builder.query<MeResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const backendData = data.data as any;
          if (backendData?.user) {
            const user: AuthUser = {
              id: backendData.user.id || backendData.user._id,
              email: backendData.user.email,
              role: backendData.user.role,
              employeeId: backendData.employee?.id || backendData.employee?._id,
              empId: backendData.employee?.empId,
              firstName: backendData.employee?.firstName,
              lastName: backendData.employee?.lastName,
              department: backendData.employee?.department,
              designation: backendData.employee?.designation,
              profileImage: backendData.employee?.profileImage,
              phone: backendData.employee?.phone,
              joinedAt: backendData.employee?.joinedAt,
            };
            dispatch(setUser(user));
          }
        } catch {
          // Handled silently
        }
      },
      providesTags: ["Auth"],
    }),

    // 4. Logout Session
    logoutUser: builder.mutation<{ success: boolean }, void>({
      queryFn: (_args, { dispatch }) => {
        dispatch(logout());
        Cookies.remove("hrms_access_token");
        Cookies.remove("hrms_refresh_token");
        return { data: { success: true } };
      },
      invalidatesTags: ["Auth"],
    }),

    // 5. Change Password
    changePassword: builder.mutation<
      { success: boolean; message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutUserMutation,
  useChangePasswordMutation,
} = authApi;
