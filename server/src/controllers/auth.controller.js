const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    clientId: user.clientId ?? null,
    fullName: user.client?.fullName ?? null,
  };
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { client: { select: { fullName: true } } },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signToken(user);
  res.json({ success: true, data: { token, user: publicUser(user) } });
});

/**
 * Self-service registration. If a client already exists with this email (from
 * the seeded dataset), the new account is linked to that client record so the
 * user immediately sees their health history.
 */
const register = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const client = await prisma.client.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'USER',
      clientId: client ? client.clientId : null,
    },
    include: { client: { select: { fullName: true } } },
  });

  const token = signToken(user);
  res.status(201).json({ success: true, data: { token, user: publicUser(user) } });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { client: { select: { fullName: true } } },
  });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: { user: publicUser(user) } });
});

module.exports = { login, register, me };
