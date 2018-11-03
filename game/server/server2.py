
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import json
import random
import os.path
from urlparse import urlparse, parse_qs

class GameServer(BaseHTTPRequestHandler):

    def __init__(self, *args):
        self.dict = {}        
        # abre o arquivo
        self.fileName = 'data.json'
        if os.path.exists(self.fileName):
            if os.path.getsize(self.fileName) > 0:
                with open(self.fileName, "r") as file:
                    self.dict = json.load(file)
        
        print 'BEGIN'
        print '  Loaded JSON data from file ' + self.fileName

        BaseHTTPRequestHandler.__init__(self, *args)

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_HEAD(self):
        self._set_headers()

    def do_GET(self):
        self._set_headers()
        
        params = parse_qs(urlparse(self.path).query)
        print "\n  REQUEST FOR GAME-SERVER: method GET, "+ params['op'][0].upper()
        print "  path: ", self.path        
        for p in params:
            print '  {0}: {1}'.format(p, params[p][0])

        op = params['op'][0]
        print "  op: ", op
        resp = '{"response": "ok", "data": "Response from Game Server by GET method"}'

        # resposta ao cliente
        print '  response: ', resp
        self.wfile.write(resp)
        print 'END\n'

    def do_POST(self):
        self._set_headers()
        self.data_string = self.rfile.read(int(self.headers['Content-Length']))
        #self.send_response(200)
        #self.end_headers()

        # parsing do json recebido
        data = json.loads(self.data_string)
        print "\n  REQUEST FOR GAME-SERVER: method POST, " + data['op'].upper()
        print "  data: " + self.data_string

        op = data['op']
        if op == 'add-trophy':
            # substitui trofeu se jah existir
            name = data['data']['name']
            self.dict[name] = data['data']
            resp = '{"response": "ok", "data": "Trophy -' + name + '- has been added"}'

        elif op == 'get-trophy':
            name = data['data']
            if name not in self.dict:
                resp = '{"response": "none", "data": "Trophy -' + name + '- not found"}'
            else:
                resp = '{"response": "ok", "data": ' + json.dumps(self.dict[name]) + '}'
        
        elif op == 'list-trophy':        
            # lista todos e devolve, montanto array json [ ] a partir do dicionario
            resp = '{"response": "ok", "data": ['
            for key in self.dict:
                resp += json.dumps(self.dict[key]) + ','
            # ultimo nao tem virgula
            resp = resp[:-1]
            resp += ']}'

        elif op == 'clear-trophy':
            self.dict.clear()
            with open("data.json", "w") as file:
                json.dump(self.dict, file)
            resp = '{"response": "ok", "data": "All Trophy data has been cleared"}'

        # grava trofeus no arquivo
        with open("data.json", "w") as file:
            json.dump(self.dict, file)
        print '  Wrote JSON data to file ' + self.fileName

        # resposta ao cliente
        print '  response: ', resp
        self.wfile.write(resp)
        print 'END\n'

        return

    def requestWriteFile(self):
        # escreve conteudo do index.html como resposta
        f = open("index.html", "r")
        self.wfile.write(f.read())

def run(server_class=HTTPServer, handler_class=GameServer, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'MIGHTY MORPHIN GAME SERVER'
    print 'HTTPD on port:', port, ' engaged'
    print 'Server URL: localhost:8000'
    print 'Stop server: Ctrl + C'
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

# se nao digitar 2o argumento, usa porta padrao (8000)
if len(argv) == 2:
    run(port=int(argv[1]))
else:
    run()
