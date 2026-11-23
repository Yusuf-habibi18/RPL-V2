import {
  CircleCheck,
  CircleHelp,
  CircleMinus,
  CircleX,
  Clock,
  OctagonAlert,
  Power,
  TriangleAlert,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { Badge, type Tone } from "@/components/ui/Badge";
import type { Prioritas, StatusKondisi, StatusRekomendasi, StatusSensor } from "@/types";

interface InfoStatus {
  label: string;
  tone: Tone;
  ikon: LucideIcon;
}

export const STATUS_KONDISI: Record<StatusKondisi, InfoStatus & { kalimat: string }> = {
  SEHAT: { label: "Sehat", tone: "success", ikon: CircleCheck, kalimat: "Kondisi lahan baik" },
  WASPADA: { label: "Perlu perhatian", tone: "warning", ikon: TriangleAlert, kalimat: "Lahan perlu perhatian" },
  KRITIS: { label: "Kritis", tone: "danger", ikon: OctagonAlert, kalimat: "Lahan dalam kondisi kritis" },
  TANPA_DATA: { label: "Belum ada data", tone: "neutral", ikon: CircleHelp, kalimat: "Belum ada data sensor" },
  KOSONG: { label: "Tidak ada tanaman", tone: "neutral", ikon: CircleMinus, kalimat: "Belum ada tanaman aktif" },
};

export const STATUS_SENSOR: Record<StatusSensor, InfoStatus> = {
  AKTIF: { label: "Terhubung", tone: "success", ikon: Wifi },
  OFFLINE: { label: "Terputus", tone: "warning", ikon: WifiOff },
  NONAKTIF: { label: "Nonaktif", tone: "neutral", ikon: Power },
};

export const STATUS_REKOMENDASI: Record<StatusRekomendasi, InfoStatus> = {
  MENUNGGU: { label: "Perlu dikerjakan", tone: "primary", ikon: Clock },
  DIKONFIRMASI: { label: "Sudah dikerjakan", tone: "success", ikon: CircleCheck },
  DIABAIKAN: { label: "Diabaikan", tone: "neutral", ikon: CircleX },
  KEDALUWARSA: { label: "Kedaluwarsa", tone: "neutral", ikon: Clock },
};

export const PRIORITAS: Record<Prioritas, InfoStatus> = {
  TINGGI: { label: "Prioritas tinggi", tone: "danger", ikon: OctagonAlert },
  SEDANG: { label: "Prioritas sedang", tone: "warning", ikon: TriangleAlert },
  RENDAH: { label: "Prioritas rendah", tone: "neutral", ikon: CircleMinus },
};

function BadgeDari({ info, size }: { info: InfoStatus; size?: "sm" | "md" }) {
  const Ikon = info.ikon;
  return (
    <Badge tone={info.tone} icon={<Ikon aria-hidden />} size={size}>
      {info.label}
    </Badge>
  );
}

export const BadgeKondisi = ({ status, size }: { status: StatusKondisi; size?: "sm" | "md" }) => (
  <BadgeDari info={STATUS_KONDISI[status]} size={size} />
);
export const BadgeSensor = ({ status }: { status: StatusSensor }) => <BadgeDari info={STATUS_SENSOR[status]} />;
export const BadgeRekomendasi = ({ status }: { status: StatusRekomendasi }) => (
  <BadgeDari info={STATUS_REKOMENDASI[status]} />
);
export const BadgePrioritas = ({ prioritas }: { prioritas: Prioritas }) => <BadgeDari info={PRIORITAS[prioritas]} />;

/** Warna hex per status untuk visualisasi SVG/grafik. */
export const WARNA_STATUS: Record<StatusKondisi, string> = {
  SEHAT: "#16A34A",
  WASPADA: "#D97706",
  KRITIS: "#DC2626",
  TANPA_DATA: "#9AA8A0",
  KOSONG: "#9AA8A0",
};
