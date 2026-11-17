#!/usr/bin/env python3
"""Genera el taller desde las preguntas del sitio, sin dependencias externas."""

import json
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'site/questions.js').read_text(encoding='utf-8')
questions = json.loads(source.split('window.QUESTIONS = ', 1)[1].strip().removesuffix(';'))


def encoded(text):
    text = text.replace('−', '-').replace('…', '...').replace('–', '-')
    return text.encode('cp1252').hex().upper()


class Page:
    def __init__(self, title, subtitle=''):
        self.ops = []
        self.text(42, 801, 'MI AVENTURA MATEMÁTICA', 10, True, '0.40 0.30 0.70')
        self.text(42, 773, title, 19, True)
        if subtitle:
            self.text(42, 751, subtitle, 10)
        self.line(42, 738, 553, 738)

    def text(self, x, y, value, size=10, bold=False, color='0.13 0.20 0.32'):
        self.ops.append(f'BT /F{"2" if bold else "1"} {size} Tf {color} rg 1 0 0 1 {x} {y} Tm <{encoded(value)}> Tj ET')

    def line(self, x1, y1, x2, y2):
        self.ops.append(f'0.78 0.80 0.84 RG 0.6 w {x1} {y1} m {x2} {y2} l S')

    def wrapped(self, value, x, y, width=86, size=10, bold=False, leading=14):
        for line in textwrap.wrap(value, width=width, break_long_words=False, break_on_hyphens=False):
            self.text(x, y, line, size, bold)
            y -= leading
        return y

    def footer(self, number, total):
        self.line(42, 35, 553, 35)
        self.text(42, 22, 'Practica con calma. ¡Cada intento cuenta!', 8)
        self.text(493, 22, f'Página {number} de {total}', 8)


pages = []
for start in range(0, len(questions), 4):
    page = Page('Taller de repaso', 'Nombre: __________________________________     Fecha: __________________')
    page.text(42, 717, 'Marca una respuesta y usa el espacio para mostrar tu procedimiento.', 10)
    y = 691
    for q in questions[start:start + 4]:
        page.text(42, y, f'{q["id"]}. {q["topic"]}', 10, True, '0.40 0.30 0.70')
        y -= 16
        y = page.wrapped(q['question'], 42, y, width=81, size=11, bold=True, leading=15)
        for row in range(0, 4, 2):
            options = '    '.join(f'{chr(65 + i)}) {q["options"][i]}' for i in range(row, row + 2))
            y = page.wrapped(options, 52, y, width=88, size=10, leading=14)
        y -= 29
        page.line(52, y, 543, y)
        y -= 22
    if y < 40:
        raise ValueError(f'No hay espacio suficiente en la página de la pregunta {start + 1}')
    pages.append(page)

extra_start = max(q['id'] for q in questions) + 1
extras = [
    (f'{extra_start}. Representa 3/4: dibuja una figura dividida en 4 partes iguales y colorea 3.',
     f'{extra_start + 1}. Dibuja una circunferencia y señala el centro, un radio, un diámetro y un arco.'),
    (f'{extra_start + 2}. Dibuja un prisma y una pirámide. Señala una base, una cara, una arista y un vértice en cada uno.',
     f'{extra_start + 3}. Votos: rojo, azul, rojo, verde, azul, rojo. Construye una tabla de frecuencias y escribe la moda.'),
    (f'{extra_start + 4}. Con los datos del ejercicio {extra_start + 3}, dibuja un diagrama de barras. Usa 1 unidad de altura por voto.',
     f'{extra_start + 5}. Con los datos del ejercicio {extra_start + 3}, crea un pictograma. Usa una estrella por voto e incluye la clave.'),
    (f'{extra_start + 6}. Dibuja y nombra un ángulo agudo, uno recto y uno obtuso. Indica una medida posible para cada uno.',
     f'{extra_start + 7}. Dibuja una figura y luego muéstrala trasladada y rotada. Marca el punto alrededor del cual la giras.')
]
for pair in extras:
    page = Page('Ahora dibuja y construye', 'Usa regla y colores si los necesitas. Explica tus ideas con dibujos.')
    for i, prompt in enumerate(pair):
        top = 704 - i * 320
        page.wrapped(prompt, 42, top, width=81, size=11, bold=True, leading=16)
        page.line(42, top - 285, 553, top - 285)
    pages.append(page)

page = Page('Respuestas para revisar', 'Para el adulto: revisen juntos el procedimiento, no solo el resultado.')
y = 712
for q in questions:
    answer = f'{q["id"]}. {chr(65 + q["answer"])}) {q["options"][q["answer"]]}. {q["explanation"]}'
    lines = textwrap.wrap(answer, width=93, break_long_words=False, break_on_hyphens=False)
    if y - len(lines) * 13 < 60:
        pages.append(page)
        page = Page('Respuestas para revisar (continuación)')
        y = 712
    y = page.wrapped(answer, 42, y, width=93, size=9, leading=13) - 7
pages.append(page)

page = Page('Respuestas de los dibujos', 'Hay distintas maneras correctas de dibujar cada figura.')
answers = [
    f'{extra_start}. Una figura con 4 partes iguales, de las cuales 3 están coloreadas.',
    f'{extra_start + 1}. El centro es el punto interior equidistante de la circunferencia. El radio une centro y circunferencia; el diámetro pasa por el centro y une dos puntos de la circunferencia; el arco es una parte de ella.',
    f'{extra_start + 2}. En cada dibujo, una cara es una superficie; una arista une dos caras y un vértice es un punto donde se unen aristas. El prisma tiene dos bases iguales y paralelas; la pirámide tiene una base y caras laterales triangulares.',
    f'{extra_start + 3}. Frecuencias: rojo 3, azul 2 y verde 1. La moda es rojo.',
    f'{extra_start + 4}. Las barras para rojo, azul y verde deben tener alturas 3, 2 y 1, respectivamente.',
    f'{extra_start + 5}. Clave: una estrella representa un voto. Rojo: 3 estrellas; azul: 2; verde: 1.',
    f'{extra_start + 6}. Por ejemplo: 45° es agudo, 90° es recto y 135° es obtuso.',
    f'{extra_start + 7}. La figura trasladada se desliza sin girar; la rotada gira alrededor de un punto fijo. En ambos casos conserva forma y tamaño.'
]
y = 710
for answer in answers:
    y = page.wrapped(answer, 42, y, width=88, size=10, leading=15) - 13
pages.append(page)

# PDF 1.4 con fuentes estándar Helvetica y codificación WinAnsi.
objects = [None, None, b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
           b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>']
page_ids = []
for number, page in enumerate(pages, 1):
    page.footer(number, len(pages))
    stream = ('\n'.join(page.ops) + '\n').encode('ascii')
    stream_id = len(objects) + 1
    objects.append(f'<< /Length {len(stream)} >>\nstream\n'.encode() + stream + b'endstream')
    page_id = len(objects) + 1
    page_ids.append(page_id)
    objects.append(f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {stream_id} 0 R >>'.encode())
objects[0] = b'<< /Type /Catalog /Pages 2 0 R >>'
objects[1] = f'<< /Type /Pages /Count {len(page_ids)} /Kids [{" ".join(f"{i} 0 R" for i in page_ids)}] >>'.encode()
pdf = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
offsets = [0]
for i, obj in enumerate(objects, 1):
    offsets.append(len(pdf))
    pdf.extend(f'{i} 0 obj\n'.encode() + obj + b'\nendobj\n')
xref = len(pdf)
pdf.extend(f'xref\n0 {len(objects) + 1}\n0000000000 65535 f \n'.encode())
for offset in offsets[1:]:
    pdf.extend(f'{offset:010} 00000 n \n'.encode())
pdf.extend(f'trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode())
output = ROOT / 'site/taller-matematicas.pdf'
output.write_bytes(pdf)
print(f'Creado {output.relative_to(ROOT)}: {len(questions)} preguntas, {len(extras) * 2} actividades de dibujo y {len(pages)} páginas.')
