/**
 * Parte el cuerpo de una lección en tarjetas cortas: una idea por pantalla.
 *
 * Reglas (sobre bloques separados por una línea en blanco):
 * - Un título (`##`) siempre abre tarjeta.
 * - `<Interactivo />` es una tarjeta propia.
 * - Una lista o una tabla se queda con el párrafo que la presenta si este termina en «:»
 *   o si juntas siguen siendo cortas; si no, va sola.
 * - Un párrafo se suma a la tarjeta anterior solo si esta es muy corta (una frase de entrada).
 */
export type Tarjeta = { tipo: "texto"; fuente: string } | { tipo: "interactivo" };

const MAX_PALABRAS = 90;
const CORTA = 30;

const palabras = (s: string) => s.replace(/[|*_#-]/g, " ").split(/\s+/).filter(Boolean).length;

export function partirEnTarjetas(cuerpo: string): Tarjeta[] {
  const bloques = cuerpo
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const tarjetas: Tarjeta[] = [];
  let actual: string[] = [];
  const cerrar = () => {
    if (actual.length) tarjetas.push({ tipo: "texto", fuente: actual.join("\n\n") });
    actual = [];
  };

  for (const b of bloques) {
    if (/^<Interactivo\b/.test(b)) {
      cerrar();
      tarjetas.push({ tipo: "interactivo" });
      continue;
    }
    const total = palabras(actual.join(" "));
    const anterior = actual[actual.length - 1] ?? "";
    const esTitulo = b.startsWith("#");
    const esListaOTabla = /^(\||[-*] |\d+\. )/.test(b);

    let unir = false;
    if (actual.length && !esTitulo) {
      if (esListaOTabla) unir = anterior.trimEnd().endsWith(":") || total + palabras(b) <= MAX_PALABRAS;
      else unir = total < CORTA && !/^(\||[-*] |\d+\. )/.test(anterior);
    }
    if (!unir) cerrar();
    actual.push(b);
  }
  cerrar();
  return tarjetas;
}
