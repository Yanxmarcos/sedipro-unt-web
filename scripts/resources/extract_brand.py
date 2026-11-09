"""One-time extraction of user-supplied Illustrator PDF paths; no raster tracing.

Requires pypdf and pypdfium2 in the authoring environment, not in production.
Usage: python scripts/resources/extract_brand.py "path/to/SEDIPRO LOGO.ai"
"""
import copy
import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, RectangleObject
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/recursos/marca'
OUT.mkdir(parents=True, exist_ok=True)
reader = PdfReader(sys.argv[1])
render = pdfium.PdfDocument(sys.argv[1])


def deref(value):
    return value.get_object() if hasattr(value, 'get_object') else value


def mul(a, b):
    return (a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1],
            a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3],
            a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5])


def rgb(values):
    return '#' + ''.join(f'{round(max(0, min(1, float(x)))*255):02x}' for x in values[:3])


def stops(function, start=0, end=1):
    f = deref(function)
    if f['/FunctionType'] == 2:
        return [(start, rgb(f['/C0'])), (end, rgb(f['/C1']))]
    if f['/FunctionType'] == 3:
        bounds = [0] + [float(v) for v in f['/Bounds']] + [1]
        result = []
        for j, sub in enumerate(f['/Functions']):
            result.extend(stops(sub, start+(end-start)*bounds[j], start+(end-start)*bounds[j+1]))
        return result
    raise ValueError('Unsupported gradient function')


def extract(number, slug, label):
    page = reader.pages[number-1]
    width, height = float(page.mediabox.width), float(page.mediabox.height)
    resources = deref(page['/Resources'])
    state = {'matrix': (1, 0, 0, 1, 0, 0), 'fill': '#000000', 'clips': []}
    stack, defs, shapes, commands = [], [], [], []
    clip_pending = False
    current = (0, 0)

    def point(x, y):
        a, b, c, d, e, f = state['matrix']
        return f'{a*x+c*y+e:.4f} {b*x+d*y+f:.4f}'

    def wrap(shape):
        for clip in state['clips']:
            shape = f'<g clip-path="url(#{clip})">{shape}</g>'
        shapes.append(shape)

    for args, op in ContentStream(page.get_contents(), reader).operations:
        op = op.decode('ascii')
        if op == 'q': stack.append(copy.deepcopy(state))
        elif op == 'Q': state = stack.pop()
        elif op == 'cm': state['matrix'] = mul(state['matrix'], tuple(float(x) for x in args))
        elif op in ('scn', 'rg'):
            state['fill'] = rgb(args)
        elif op == 'm':
            current = tuple(map(float, args)); commands.append('M'+point(*current))
        elif op == 'l':
            current = tuple(map(float, args)); commands.append('L'+point(*current))
        elif op in ('c', 'v', 'y'):
            v = list(map(float, args))
            if op == 'v': v = list(current)+v
            if op == 'y': v = v+v[-2:]
            commands.append('C'+' '.join(point(v[k], v[k+1]) for k in (0, 2, 4)))
            current = tuple(v[-2:])
        elif op == 'h': commands.append('Z')
        elif op == 're':
            x,y,w,h = map(float,args)
            commands.append('M'+point(x,y)+' L'+point(x+w,y)+' L'+point(x+w,y+h)+' L'+point(x,y+h)+' Z')
        elif op in ('W', 'W*'): clip_pending = op
        elif op in ('f', 'f*', 'n'):
            path = ' '.join(commands)
            if op != 'n': wrap(f'<path d="{path}" fill="{state["fill"]}" fill-rule="{"evenodd" if op=="f*" else "nonzero"}"/>')
            if clip_pending:
                key = f'clip{len(defs)}'
                defs.append(f'<clipPath id="{key}"><path d="{path}" clip-rule="{"evenodd" if clip_pending=="W*" else "nonzero"}"/></clipPath>')
                state['clips'].append(key)
            commands, clip_pending = [], False
        elif op == 'sh':
            shading = deref(deref(resources['/Shading'])[args[0]])
            if shading['/ShadingType'] != 2: raise ValueError('Unsupported shading')
            x1,y1,x2,y2 = map(float, shading['/Coords'])
            matrix = ' '.join(str(v) for v in state['matrix'])
            key = f'gradient{len(defs)}'
            colors = ''.join(f'<stop offset="{pos:.7f}" stop-color="{color}"/>' for pos,color in stops(shading['/Function']))
            defs.append(f'<linearGradient id="{key}" gradientUnits="userSpaceOnUse" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" gradientTransform="matrix({matrix})">{colors}</linearGradient>')
            wrap(f'<rect width="{width}" height="{height}" fill="url(#{key})"/>')
        elif op not in ('BDC','EMC','cs','gs','BX','EX'):
            raise ValueError(f'Unsupported PDF operator {op}')

    bounds = [obj.get_bounds() for obj in render[number-1].get_objects()
              if obj.type in (pdfium.raw.FPDF_PAGEOBJ_PATH, pdfium.raw.FPDF_PAGEOBJ_SHADING)]
    left=min(b[0] for b in bounds); bottom=min(b[1] for b in bounds)
    right=max(b[2] for b in bounds); top=max(b[3] for b in bounds)
    margin = max(right-left, top-bottom)*0.025
    left-=margin; right+=margin; bottom-=margin; top+=margin
    w,h=right-left, top-bottom
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.4f}" height="{h:.4f}" viewBox="{left:.4f} {height-top:.4f} {w:.4f} {h:.4f}"><title>{escape(label)}</title><metadata>Source: user-supplied SEDIPRO LOGO.ai; Illustrator artboard {number}; vector paths retained.</metadata><defs>{"".join(defs)}</defs><g transform="translate(0 {height}) scale(1 -1)">{"".join(shapes)}</g></svg>'
    (OUT/f'{slug}.svg').write_text(svg,encoding='utf-8')
    pdf = copy.deepcopy(page)
    # Illustrator stores private editable document data on every artboard. It is
    # available in the untouched .ai download, not in each delivery PDF.
    for key in ('/PieceInfo', '/Metadata', '/Thumb', '/Annots'):
        if key in pdf: del pdf[key]
    pdf.mediabox = RectangleObject([left,bottom,right,top]); pdf.cropbox=pdf.mediabox
    pdf.trimbox=pdf.mediabox; pdf.bleedbox=pdf.mediabox; pdf.artbox=pdf.mediabox
    writer=PdfWriter(); writer.add_page(pdf)
    writer.add_metadata({'/Title':label,'/Creator':'SEDIPRO UNT — Illustrator vector source'})
    with (OUT/f'{slug}.pdf').open('wb') as handle: writer.write(handle)
    return {'slug':slug,'width':round(w),'height':round(h),'artboard':number,'name':label}


rows=[]
for i,area in enumerate(['unt','mkt','ltk-fnz','gth','pmo','ti']):
    suffix='UNT' if area=='unt' else area.upper().replace('LTK-FNZ','LTK y FNZ')
    rows.append(extract(i+1,f'logo-{area}-color',f'SEDIPRO {suffix} · Color'))
    rows.append(extract(i+23,f'isotipo-{area}-color',f'Isotipo SEDIPRO {suffix} · Color'))
    rows.append(extract(i+35,f'isotipo-{area}-claro',f'Isotipo SEDIPRO {suffix} · Claro'))
    if area!='unt': rows.append(extract(i+29,f'logo-{area}-claro',f'SEDIPRO {suffix} · Claro'))
rows.append(extract(19,'logo-unt-vertical-color','SEDIPRO UNT · Vertical'))
rows.append(extract(20,'logo-unt-vertical-claro','SEDIPRO UNT · Vertical claro'))
(ROOT/'.impeccable/review/recursos/vectores.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(rows)} variantes SVG/PDF extraídas de trazados originales')
