# Cómo editar los textos de la plataforma

Todo el texto vive en esta carpeta (`content/`). No necesitas tocar nada fuera de ella.

## Qué hay en cada archivo

| Archivo | Qué contiene |
|---|---|
| `sitio.json` | Portada, menús, nombres de los pilotos, módulos, insignias y textos de botones |
| `lecciones/01-….mdx` … `12-….mdx` | Las 12 lecciones |
| `preguntas/repaso.json` | Las preguntas de repaso de cada lección (2 o 3 por lección) |
| `interactivos/*.json` | Los textos de cada ejercicio interactivo |
| `antimodelos.json` | Los 8 antimodelos |
| `cerebros.json` | La red de los dos cerebros: nodos, pasos y escenarios |
| `escenarios/*.json` | Los escenarios del simulador de crisis |
| `pausa.json` | El protocolo PAUSA (lección 12, kit e instructor) |
| `diagnostico.json` | Las 10 situaciones del diagnóstico «¿Qué delegado eres hoy?» |
| `gimnasio.json` | Los 4 ejercicios del gimnasio (preguntas, frases, respiración) |
| `persuasion.json` | El laboratorio de persuasión (clasificación, constructor, ética) |
| `mapa-lider.json` | Las 8 habilidades de Mi mapa de líder y sus ejercicios |
| `kit.json` | Checklist, tarjeta PAUSA y reflexión posterior |
| `instructor.json` | Las diapositivas y notas del modo instructor |
| `fuentes.json` | La página «Para saber más» |
| `el-lider-que-se-hace.md` | El documento original (referencia; la plataforma no lo muestra) |

## Editar una lección (`.mdx`)

Cada lección tiene dos partes:

1. **Arriba, entre las dos líneas `---`**, los datos: título, idea clave, ejemplo y «Pruébalo hoy».
   - Deja siempre el texto **entre comillas**: `titulo: "Mi título"`.
   - Si el texto lleva comillas dobles adentro, usa comillas latinas: «así».
   - No cambies los nombres de la izquierda (`titulo:`, `ideaClave:`…) ni la sangría (los espacios al inicio).
2. **Abajo**, la explicación, en texto normal:
   - `**negrita**`, `*cursiva*`
   - Listas con `-` o `1.`
   - Tablas con `|`
   - Si escribes la línea `<Interactivo />`, el ejercicio aparece en ese lugar. Si no la escribes, aparece al final de la explicación.

**Una idea por pantalla.** La lección se muestra en tarjetas, como en una app de idiomas. Cada párrafo separado por una **línea en blanco** se vuelve una pantalla (un párrafo muy corto se une al siguiente, y una lista o tabla se queda con la frase que la presenta si esta termina en «:»). Para que nadie se sature, procura que cada párrafo tenga menos de 70 palabras. Después del texto vienen, en este orden: el ejercicio, el ejemplo en el comité, las preguntas (de una en una) y «Pruébalo hoy».

**Límite:** cada lección debe durar 8 minutos como máximo. Si la alargas demasiado, la plataforma no se publica y te avisa qué lección acortar.

## Editar archivos `.json`

- Cambia solo el texto que está **entre comillas** a la derecha de los dos puntos.
- No borres comas, corchetes `[ ]` ni llaves `{ }`.
- En las preguntas, exactamente **una** opción debe tener `"correcta": true`.

## Si algo falla

Al publicar (`npm run build`), la plataforma revisa el contenido. Si hay un error, te dice el archivo y el campo exactos. Por ejemplo:

```
✖ Error en content/preguntas/repaso.json
  → cada pregunta necesita exactamente una opción correcta
```

## Colores (no cambiar su significado)

Rojo = instinto · Ámbar = emoción · Verde = razón. Se usan solo con ese significado en toda la plataforma.
