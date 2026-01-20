import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        console.log('Attempting login for:', credentials.email)

        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          console.log('User not found:', credentials.email)
          return null
        }

        console.log('User found:', user.email, 'Comparing passwords...')

        // Compare password with stored password
        if (credentials.password !== user.password) {
          console.log('Password mismatch for user:', user.email)
          return null
        }

        console.log('Login successful for user:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.role = token.role
        session.user.name = token.name
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  debug: process.env.NODE_ENV === 'development'
}
