// modules/admin/config/routes.ts
// Admin module routes

export const ADMIN_ROUTES = {
  QUESTIONS: "/admin/questions",
  QUESTION_NEW: "/admin/questions/new",
  QUESTION_EDIT: (id: string) => `/admin/questions/${id}/edit`,
  QUESTION_VIEW: (id: string) => `/admin/questions/${id}`,
} as const;

export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];
