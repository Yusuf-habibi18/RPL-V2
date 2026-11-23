import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { NAMA_COOKIE, bacaTokenSesi } from "@/lib/session";
import type { Peran } from "@/types";

/**
 * Pengguna yang sedang login, dibaca ulang dari database di setiap permintaan
 * sehingga perubahan role atau penonaktifan akun langsung berlaku.
 */
export const getCurrentUser = cache(async () => {
  const sesi = await bacaTokenSesi((await cookies()).get(NAMA_COOKIE)?.value);
  if (!sesi) return null;
  const user = await prisma.user.findUnique({
    where: { id: sesi.sub },
    include: { kelompok: true, memimpin: true },
  });
  if (!user || !user.aktif) return null;
  return { ...user, peran: user.peran as Peran };
});

export type PenggunaAktif = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Wajib login; bila `peran` diisi, hanya role tersebut yang boleh lanjut. */
export async function requireUser(peran?: Peran[]): Promise<PenggunaAktif> {
  const user = await getCurrentUser();
  // Token sah tetapi akunnya sudah dihapus/dinonaktifkan: "keluar=1" membuat middleware
  // menghapus cookie sesi. Tanpa ini /login ↔ /dashboard saling mengalihkan tanpa henti.
  if (!user) redirect("/login?keluar=1");
  if (peran && !peran.includes(user.peran)) redirect("/akses-ditolak");
  return user;
}
