// Tema grafik bersama (permukaan putih).

/**
 * Palet kategori (urutan tetap, tidak diputar ulang; hijau = identitas di urutan pertama).
 * Divalidasi untuk permukaan #FFFFFF: lightness band, chroma, CVD ΔE ≥ 14.9,
 * normal-vision ΔE ≥ 18.5, kontras ≥ 3:1 — semua PASS. Legenda/label tetap selalu tampil.
 */
export const KATEGORI = ["#16834A", "#2563EB", "#C0438F", "#8B5CF6"] as const;

export const WARNA = {
  primary: "#16834A",
  emerald: "#20B66A",
  lime: "#A3E635",
  data: "#2563EB",
  success: "#15803D",
  warning: "#D97706",
  danger: "#DC2626",
  muted: "#718078",
  fg: "#17251D",
  surface: "#FFFFFF",
  grid: "rgba(23,37,29,0.07)",
};

/** Warna seri sensor per parameter (satu seri per grafik, judul kartu menamainya). */
export const WARNA_SENSOR = {
  kelembapanTanah: "#16834A",
  ph: "#2563EB",
  suhu: "#8B5CF6",
} as const;

export const TOOLTIP = {
  contentStyle: {
    background: "#FFFFFF",
    border: "1px solid #E3EBE5",
    borderRadius: 12,
    boxShadow: "0 12px 28px -12px rgba(18,59,40,0.28)",
    padding: "8px 12px",
    fontSize: 12,
  },
  labelStyle: { color: "#718078", marginBottom: 4 },
  itemStyle: { color: "#17251D", padding: 0 },
};

export const SUMBU = {
  stroke: "#718078",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;
