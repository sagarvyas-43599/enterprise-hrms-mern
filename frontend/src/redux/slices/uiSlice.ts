import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ModalType =
  | "CHECK_IN_ATTENDANCE"
  | "CHECK_OUT_ATTENDANCE"
  | "APPLY_LEAVE"
  | "ADD_EMPLOYEE"
  | "EDIT_EMPLOYEE"
  | "ADD_DEPARTMENT"
  | "GENERATE_PAYROLL"
  | "CREATE_GOAL"
  | "INITIATE_APPRAISAL"
  | "ASSIGN_ASSET"
  | "CREATE_TICKET"
  | "DRAFT_POLICY"
  | "USER_PROFILE"
  | null;

interface UiState {
  sidebarOpen: boolean;
  activeModal: ModalType;
  modalData: unknown;
  theme: "light" | "dark";
}

const initialState: UiState = {
  sidebarOpen: true,
  activeModal: null,
  modalData: null,
  theme: "light",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (
      state,
      action: PayloadAction<{ modalType: ModalType; data?: unknown }>
    ) => {
      state.activeModal = action.payload.modalType;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  toggleTheme,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
