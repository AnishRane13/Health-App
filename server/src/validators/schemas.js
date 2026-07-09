const { z } = require('zod');

const emailField = z.string().email('A valid email is required');
const passwordField = z.string().min(6, 'Password must be at least 6 characters');

const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: z.string().min(1, 'Password is required'),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
    fullName: z.string().min(1).optional(),
  }),
});

const listUsersSchema = z.object({
  query: pagination.extend({
    search: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    gender: z.string().trim().optional(),
    healthCondition: z.string().trim().optional(),
    sortBy: z.enum(['fullName', 'createdAt', 'age', 'city']).default('fullName'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
});

const clientIdParam = z.object({
  params: z.object({
    clientId: z.coerce.number().int().positive('Invalid client id'),
  }),
});

const clientReportsSchema = clientIdParam.extend({
  query: pagination,
});

const reportHistorySchema = z.object({
  query: pagination,
});

const insightSchema = z.object({
  body: z.object({
    reportId: z.string().min(1).optional(),
  }),
});

module.exports = {
  loginSchema,
  registerSchema,
  listUsersSchema,
  clientIdParam,
  clientReportsSchema,
  reportHistorySchema,
  insightSchema,
};
