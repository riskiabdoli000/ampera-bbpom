import { redirect } from "next/navigation";
import { DEFAULT_PANDUAN_SLUG } from "@/lib/panduan";

export default function PanduanIndexPage() {
  redirect(`/panduan/${DEFAULT_PANDUAN_SLUG}`);
}

