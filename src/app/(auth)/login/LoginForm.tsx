"use client";

import { Eye, EyeOff, LogIn, OctagonAlert } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { login, type StatusLogin } from "@/lib/actions/auth";

const AKUN_DEMO = [
  { email: "petani1@agri.local", peran: "Petani" },
  { email: "ketua@agri.local", peran: "Ketua kelompok" },
  { email: "dinas@agri.local", peran: "Dinas" },
  { email: "admin@agri.local", peran: "Admin" },
];

export function LoginForm({ tujuan, tampilkanDemo }: { tujuan?: string; tampilkanDemo: boolean }) {
  const [state, aksi, pending] = useActionState<StatusLogin, FormData>(login, {});
  const [lihat, setLihat] = useState(false);
  const [email, setEmail] = useState(state.email ?? "");
  const [password, setPassword] = useState("");

  return (
    <div>
      <form action={aksi} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={tujuan ?? ""} />
        {state.error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-danger/35 bg-danger/10 px-3.5 py-3 text-sm text-danger">
            <OctagonAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {state.error}
          </div>
        )}
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@contoh.id"
            aria-invalid={!!state.error}
          />
        </Field>
        <Field label="Kata sandi" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={lihat ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-11"
              aria-invalid={!!state.error}
            />
            <button
              type="button"
              onClick={() => setLihat((v) => !v)}
              className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-fg"
              aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {lihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={pending}>
          {!pending && <LogIn />} Masuk
        </Button>
      </form>

      {tampilkanDemo && (
        <div className="mt-6 rounded-xl border border-dashed border-line p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Akun demo · kata sandi password123</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {AKUN_DEMO.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setEmail(a.email);
                  setPassword("password123");
                }}
                className="rounded-lg border border-line bg-bg/50 px-3 py-2 text-left text-xs transition-colors hover:border-primary/40"
              >
                <span className="block font-semibold text-fg">{a.peran}</span>
                <span className="block truncate text-muted">{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
