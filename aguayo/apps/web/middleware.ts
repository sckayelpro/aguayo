// apps/web/src/middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Lógica adicional si es necesaria
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/auth/signup/role", "/auth/signup/personal", "/auth/signup/documents", "/auth/signup/finish"]
}