"""Servidor local E3 Rev2 para Windows, sin dependencias externas de Python."""
import http.server
import socketserver
import webbrowser
from pathlib import Path
import os

ROOT=Path(__file__).resolve().parent
os.chdir(ROOT)
class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
port=server.server_address[1]
url=f'http://127.0.0.1:{port}/e3_rev2.html'
print('='*70)
print(' WEBGIS PUERTO SECO SAN ROMAN - INFORME E3 REV2')
print('='*70)
print('URL LOCAL: ',url)
print('La ventana debe permanecer abierta mientras se usa el visor.')
print('Para finalizar, presione Ctrl+C.')
print('Si no se abre el navegador, copie la URL anterior.')
try:
    webbrowser.open_new_tab(url)
    server.serve_forever()
except KeyboardInterrupt: print('\nServidor detenido.')
finally: server.server_close()
