import { NextResponse, type NextRequest } from "next/server";
import { bolehAkses } from "@/lib/akses";
import { NAMA_COOKIE, bacaTokenSesi, buatTokenSesi, opsiCookie } from "@/lib/session";

/**
 * FR-01, FR-02, NFR-09:
 * - belum login → /login
 * - role tidak berhak → /akses-ditolak (T-02)
 * - setiap permintaan memperpanjang sesi (sliding expiration)
 *
 * Middleware hanya penyaring awal. Halaman & server action tetap memeriksa role dari database.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sesi = await bacaTokenSesi(req.cookies.get(NAMA_COOKIE)?.value);

  if (pathname === "/login") {
    // Sesi basi (akun dihapus/dinonaktifkan): hapus cookie lalu tampilkan form login.
    if (req.nextUrl.searchParams.has("keluar")) {
      const res = NextResponse.next();
      res.cookies.delete(NAMA_COOKIE);
      return res;
    }
    return sesi ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next();
  }

  if (!sesi) {
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(NAMA_COOKIE);
    return res;
  }

  if (!bolehAkses(sesi.peran, pathname)) {
    return NextResponse.redirect(new URL("/akses-ditolak", req.url));
  }

  const res = NextResponse.next();
  res.cookies.set(NAMA_COOKIE, await buatTokenSesi(sesi), opsiCookie);
  return res;
}

export const config = {
  // API memiliki autentikasinya sendiri (sensor memakai API key).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico|webp)$).*)"],
};
