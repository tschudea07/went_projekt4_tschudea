import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '../../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { sendEmail } from './email.js';
import { trustedOrigins } from './config.js';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      const htmlUrl = escapeHtml(url);

      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify your email address',
          text: `Open this link to verify your email address: ${url}`,
          html: `
            <p>Open this link to verify your email address:</p>
            <p><a href="${htmlUrl}">${htmlUrl}</a></p>
          `,
        });
      } catch (error: unknown) {
        console.error('Failed to send verification email', error);
      }
    },
  },
  trustedOrigins,
});
