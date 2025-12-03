import NextAuth, { type NextAuthResult } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prismaAuth } from "@repo/db"

const authResult = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await prismaAuth.user.findUnique({
            where: { email }
          })
          
          if (!user) return null
          
          const passwordsMatch = await bcrypt.compare(password, user.password)
          
          if (passwordsMatch) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
            }
          }
        }
        
        return null
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ auth, request }) {
      const { nextUrl } = request
      const isLoggedIn = !!auth

      const isPublicRoute = nextUrl.pathname.startsWith('/auth') || nextUrl.pathname === '/'
      const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard')

      // Bloquer l'accès aux routes protégées si non connecté
      if (isProtectedRoute && !isLoggedIn) {
        return false
      }

      return true
    },
  },
})

export const handlers: NextAuthResult['handlers'] = authResult.handlers
export const auth: NextAuthResult['auth'] = authResult.auth
export const signIn: NextAuthResult['signIn'] = authResult.signIn
export const signOut: NextAuthResult['signOut'] = authResult.signOut