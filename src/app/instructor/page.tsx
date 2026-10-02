import type { Metadata } from "next";
import type { DatosPausa } from "@/components/interactivos/CaminoPausa";
import { Instructor } from "@/components/Instructor";
import { getJSON } from "@/content/load";

export const metadata: Metadata = { title: "Modo instructor" };

export default function InstructorPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datos = getJSON<any>("instructor.json");
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="mb-4 text-4xl font-semibold sm:text-5xl">{datos.titulo}</h1>
      <Instructor datos={datos} pausa={getJSON<DatosPausa>("pausa.json")} />
    </div>
  );
}
