// modules/admin/config/messages.ts
// Admin module i18n message keys

export const ADMIN_MESSAGES = {
  // Page titles
  TITLE: "admin.title",
  QUESTIONS_TITLE: "admin.questions.title",

  // Actions
  ADD_QUESTION: "admin.questions.add",
  EDIT_QUESTION: "admin.questions.edit",
  DELETE_QUESTION: "admin.questions.delete",
  VIEW_QUESTION: "admin.questions.view",
  SAVE: "admin.save",
  CANCEL: "admin.cancel",
  CONFIRM_DELETE: "admin.confirmDelete",

  // Filters
  FILTER_COURSE: "admin.filters.course",
  FILTER_TOPIC: "admin.filters.topic",
  FILTER_DIFFICULTY: "admin.filters.difficulty",
  FILTER_TYPE: "admin.filters.type",
  FILTER_SEARCH: "admin.filters.search",
  FILTER_CLEAR: "admin.filters.clear",

  // Table columns
  COL_QUESTION: "admin.table.question",
  COL_COURSE: "admin.table.course",
  COL_TOPIC: "admin.table.topic",
  COL_DIFFICULTY: "admin.table.difficulty",
  COL_TYPE: "admin.table.type",
  COL_STATUS: "admin.table.status",
  COL_ACTIONS: "admin.table.actions",

  // Form fields
  FIELD_QUESTION: "admin.form.question",
  FIELD_QUESTION_HE: "admin.form.questionHe",
  FIELD_SOLUTION: "admin.form.solution",
  FIELD_SOLUTION_HE: "admin.form.solutionHe",
  FIELD_ANSWER: "admin.form.answer",
  FIELD_HINTS: "admin.form.hints",
  FIELD_TAGS: "admin.form.tags",
  FIELD_TIME: "admin.form.estimatedTime",
  FIELD_ACTIVE: "admin.form.active",

  // Status
  STATUS_ACTIVE: "admin.status.active",
  STATUS_INACTIVE: "admin.status.inactive",

  // Messages
  SUCCESS_CREATED: "admin.messages.created",
  SUCCESS_UPDATED: "admin.messages.updated",
  SUCCESS_DELETED: "admin.messages.deleted",
  ERROR_GENERIC: "admin.messages.error",
  NO_QUESTIONS: "admin.messages.noQuestions",
  LOADING: "admin.messages.loading",
} as const;
