import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export { auth as middleware } from './lib/auth'

// Logique personnalisée avec callbacks NextAuth
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
