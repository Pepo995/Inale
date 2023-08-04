import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicPaths: string[] = [
  "/*", // Opening every page while user auth is not working properly
  "/producer/*",
  "/sign-in",
  "/api/curd",
  "/api/salting",
  "/api/maturation",
];

const isPublic = (path: string) =>
  publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", ".*$")))
  );

export default authMiddleware({
  afterAuth(auth, request) {
    if (isPublic(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    // handle users who aren't authenticated
    if (!auth.userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set(
        "redirect_url",
        request.headers.get("Host") ?? request.nextUrl.host
      );
      return NextResponse.redirect(signInUrl);
    }
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!static|.*\\..*|_next|favicon.ico).*)",
    "/",
  ],
};
