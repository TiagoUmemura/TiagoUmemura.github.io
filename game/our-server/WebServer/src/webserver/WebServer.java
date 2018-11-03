
/*
 * Game Server. 
 */
package webserver;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public final class WebServer {

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");

    public static void log(String message) {
        //System.out.println(dateFormat.format(Calendar.getInstance().getTime()) + " " + message);
    }

    public static void main(String argv[]) throws Exception {
        int port = 8000; // Porta que o servidor ouvirá
        String dirBase = "/home/"; // diretório onde estarão os arquivos
        
        Multicast multiserver = new Multicast();
        Thread t1 = new Thread(multiserver);
        t1.start();
        
        log("Servidor Web iniciado.\n Porta:" + port);
        ServerSocket serverSocket = new ServerSocket(port); // Cria um servidor de socket

        //colocar a thread para ouvir aqui
        //http://www.devmedia.com.br/java-sockets-criando-comunicacoes-em-java/9465
        

        Multicast multiserver2 = new Multicast();
        multiserver2.sendMessage("testandoooooo");

        while (true) { // Loop infinito aguardando conexões
            Socket socket = serverSocket.accept(); // Escuta o socket
            new Thread(new RequesteHandle(socket, dirBase)).run();
        }
    }
}

final class RequesteHandle implements Runnable {

    final static String CRLF = "\r\n";
    String dirBase;
    Socket socket;
    InputStream input;
    OutputStream output;
    private String requestPath;
    private HashMap<String, String> requestHeader;
    private HashMap<String, String> cookieParams;
    public static Player player;

    public RequesteHandle(Socket socket, String diretorioBase) throws Exception {
        this.socket = socket;
        this.input = socket.getInputStream();
        this.output = socket.getOutputStream();

        this.dirBase = diretorioBase;
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();

        output.close();
        input.close();
        socket.close();
    }

    @Override
    public void run() {
        try {
            WebServer.log("REQUEST RECEIVED ========================");
            requestHeader = buildRequestMap();
            cookieParams = buildCookieParams();

            byte[] response = null;
            /* tipo da requisicao */
            if (requestHeader.containsKey("GET")) {

                response = responseGet(requestHeader);

            } else if (requestHeader.containsKey("POST")) {

                response = responsePost(requestHeader);

            } else {
                response = response501_NotImplemented();
            }

            //envia resposta
            output.write(response);
            WebServer.log("RESPONSE PROCESSED========================\n" + new String(response));

            finalize(); // força um fim
        } catch (Throwable e) {
            WebServer.log(e.getMessage());
            e.printStackTrace();
        }

    }

    private HashMap<String, String> buildRequestMap() throws IOException {
        //System.out.println("buildRequestMap()");
        BufferedReader reader = new BufferedReader(new InputStreamReader(this.input));
        /* monta o header em HashMap */
        HashMap<String, String> requestHeader = new HashMap<String, String>();

        String requestLine = reader.readLine();

        while (requestLine != null && !requestLine.trim().isEmpty()) {
            String[] split = requestLine.split(" ", 2);
            requestHeader.put(split[0], split[1]);
            //WebServer.log(split[0] + " " + split[1]);
            WebServer.log(requestLine);
            requestLine = reader.readLine();

        }

        //ler letra por letra do body e setar chave Json com o json
        if (requestHeader.containsKey("POST")) {
            String jsonbody = "";
            System.out.println("");
            int contentlenght = Integer.parseInt(requestHeader.get("Content-Length:"));
            for (int i = 0; i < contentlenght; i++) {
                //System.out.println(jsonbody);
                jsonbody += (char) reader.read();
            }
            WebServer.log(jsonbody);
            requestHeader.put("Json", jsonbody);
        }

        return requestHeader;
    }

    private HashMap<String, String> buildCookieParams() throws IOException {
        HashMap<String, String> cookieParams = new HashMap<String, String>();
        if (requestHeader.containsKey("Cookie:")) {
            String[] cookieLine = requestHeader.get("Cookie:").split(";");
            for (String param : cookieLine) {
                String[] split = param.split("=");
                cookieParams.put(split[0].trim(), split[1].trim());
                WebServer.log(split[0] + " " + split[1]);
            }
        }
        return cookieParams;
    }

    private byte[] responseGet(HashMap<String, String> requestHeader) throws Exception {
        /* nome do recurso requisitado */
        String[] getParams = requestHeader.get("GET").split(" ");

        this.requestPath = getParams[0];

        if (this.requestPath.contains("/game/profile")) {

            return response_getJson();

        } else {

            //se nao, acessa os arquivos do jogo
            String fileName = this.requestPath;
            File file = new File(fileName);

            if (!file.exists()) {

                return response404_NotFound(this.requestPath);

            } else {
                if (file.isDirectory()) {
                    return response200_processDir(file);
                } else {
                    return response200_processFile(file);
                }
            }

        }
    }

    private byte[] response_getJson() throws Exception, IOException {

        System.out.println("RESPONSE_GETJASON");
        String contentType = "application/json";

        Gson gson = new Gson();
        String json = gson.toJson(DAO.getPlayer());
        byte[] jsonBanco = json.getBytes();

        String responseHeader = "HTTP/1.1 200 OK\n"
                + "Content-Length: " + jsonBanco.length + "\n"
                + "Content\"application/json\";\n"
                + "        byte[] content = getJsonFromBD();\n"
                + "        String responseHeader = \"HTTP/1.1 200 OK\\n\"\n"
                + "                + \"Content-Leng-Type: " + contentType + "\n"
                + "Set-Cookie: " + processCookieParams() + "\n"
                + "\n";

        ByteArrayOutputStream result = new ByteArrayOutputStream();
        result.write(responseHeader.getBytes());
        result.write(jsonBanco);

        return result.toByteArray();
    }

    private byte[] responsePost(HashMap<String, String> requestHeader) throws Exception {
        String[] getParams = requestHeader.get("POST").split(" ");

        this.requestPath = getParams[0];

        if (this.requestPath.contains("/game/profile")) {//se tem /game/profile entao acessa os arquivos
            return response_postJson(requestHeader);

        } else {
            return response400_BadRequest();
        }
    }

    private byte[] response_postJson(HashMap<String, String> requestHeader) throws Exception, IOException {

        String contentType = "application/json";
        byte[] content = postJson(requestHeader);

        String responseHeader = "HTTP/1.1 200 OK\n"
                + "Content-Length: " + content.length + "\n"
                + "Content-Type: " + contentType + "\n"
                + "Set-Cookie: " + processCookieParams() + "\n"
                + "\n";

        ByteArrayOutputStream result = new ByteArrayOutputStream();
        result.write(responseHeader.getBytes());
        result.write(content);
        return result.toByteArray();
    }

    private byte[] postJson(HashMap<String, String> requestHeader) throws ClassNotFoundException, SQLException, InstantiationException, IllegalAccessException {
        //{"id":"2","op":"add-trophy", data: {"name": "10 coins", "xp": "30", "title": "IT\'S A START","description": "Collected first 10 coins on the game"}}
        String requestJson = new String();
        String content = "";
        Gson gson = new Gson();

        System.out.println("HEADER --- " + requestHeader.toString() + "----------");
        requestJson = requestHeader.get("Json");
        System.out.println("JSON" + requestJson);

        if (requestJson.contains("add-profile")) {

            player = gson.fromJson(requestJson, Player.class);
            System.out.println("Player: " + player.data.email);
            if (!DAO.verifyPlayerLogin(player)) {
                boolean result = DAO.addPlayer(player);
                if (result) {
                    content = "{\"response\": \"ok\", \"data\": \"\"}";
                } else {
                    content = "{\"response\": \"error\", \"data\": \"\"}";
                }
            } else if (DAO.verifyPlayerLogin(player)) {
                boolean result = DAO.veifyPlayerPassword(player);
                if (result) {
                    content = "{\"response\": \"ok\", \"data\": \"\"}";
                } else {
                    content = "{\"response\": \"error\", \"data\": \"\"}";
                }
            }

        } else if (requestJson.contains("list-trophy")) {

            String trophys = DAO.listTrophy(player);

            content = "{\"response\": \"ok\", \"data\": [" + trophys + "]}";

        } else if (requestJson.contains("add-trophy")) {
            //operacoes do json aqui
            //Gson transforma string json para classe java, funciona para classe com subclasse como no caso do trofeu
            System.out.println("ENTROU ADD TROPHY");

            Trophy trophy = gson.fromJson(requestJson, Trophy.class);
            WebServer.log("JSONCLASS: " + trophy.id + " " + trophy.op + " " + trophy.data.name + " " + trophy.data.title + " " + trophy.data.description);

            if (!DAO.verifyTrophy(trophy.id, trophy.data.name)) {
                DAO.addTrophy(trophy);
            }

            content = "{\"response\": \"ok\", \"data\": \"\"}";

        } else if (requestJson.contains("save-state")) {

            System.out.println("Save State");

            SaveState savestate = gson.fromJson(requestJson, SaveState.class);

            DAO.updateCoordinates(savestate);

            //System.out.println("\n\nSaveState: " + savestate.id + "\n X:" + savestate.data.x);
            content = "{\"response\": \"ok\", \"data\": \"\"}";

        } else if (requestJson.contains("load-state")) {

            System.out.println("Load State");

            String coord = DAO.getCoordinates(player);

            content = "{\"response\": \"ok\", \"data\": {" + coord + "}}";
        }

        return content.getBytes();
    }

    private String processCookieParams() {
        /* Processa o parâmetro 'counter' */
        int counter = 0;
        if (cookieParams.containsKey("counter")) {
            counter = Integer.parseInt(cookieParams.get("counter"));
            counter++;
        }
        cookieParams.put("counter", "" + counter);

        /* Retorna todos os parâmetros dos Cookie, inclusive os que foram recebidos */
        StringBuffer sb = new StringBuffer();
        for (Entry<String, String> entry : cookieParams.entrySet()) {
            sb.append(entry.getKey()).append("=").append(entry.getValue()).append(";");
        }
        return sb.toString();
    }

    private byte[] response404_NotFound(String resource) throws IOException {
        String responseHeader = "HTTP/1.1 404 Not found\n"
                + "\n"
                + "<!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 2.0//EN\"><html><head><title>"
                + "404 Not Found"
                + "</title></head><body><h1>Not Found</h1><p>The requested URL "
                + resource
                + " was not found on this server.</p><hr><address>"
                + "ValentinServer/0.1.1b on "
                + requestHeader.get("Host:")
                + "</address></body></html>";
        return responseHeader.getBytes();
    }

    private byte[] response401_NotAuthorized() throws IOException {
        String responseHeader = "HTTP/1.1 401 Not Authorized\n"
                + "WWW-Authenticate: Basic realm=\"Entre com usuário e senha\"\n"
                + "\n"
                + "<!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 2.0//EN\"><html><head><title>"
                + "401 Not Authorized"
                + "</title></head><body><h1>Not Authorized</h1><p>The requested URL "
                + " was under security constraint.</p><hr><address>"
                + "Valentin/0.1.1b on "
                + requestHeader.get("Host:")
                + "</address></body></html>";

        return responseHeader.getBytes();
    }

    private byte[] response501_NotImplemented() throws IOException {
        String responseHeader = "HTTP/1.1 501 Not implemented\n"
                + "\n"
                + "<!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 2.0//EN\"><html><head><title>"
                + "501 Not implemented"
                + "</title></head><body><h1>Not implemented</h1><p>The requested URL "
                + " was under security constraint.</p><hr><address>"
                + "ValentinServer/0.1.1b on "
                + requestHeader.get("Host:")
                + "</address></body></html>";
        return responseHeader.getBytes();
    }

    private byte[] response400_BadRequest() throws IOException {
        String responseHeader = "HTTP/1.1 400 Bad Request\n"
                + "\n"
                + "<!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 2.0//EN\"><html><head><title>"
                + "400 Bad Request"
                + "</title></head><body><h1>Bad Request</h1><p>The requested URL "
                + " was under security constraint.</p><hr><address>"
                + "ValentinServer/0.1.1 on "
                + requestHeader.get("Host:")
                + "</address></body></html>";
        return responseHeader.getBytes();
    }

    private static byte[] sendBytes(FileInputStream fis)
            throws Exception {
        byte[] buffer = new byte[1024];
        int bytes = 0;

        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        while ((bytes = fis.read(buffer)) != -1) {
            stream.write(buffer, 0, bytes);
        }
        stream.flush();
        return stream.toByteArray();
    }

    private String compileScript(String source) {
        source = source.substring(2, source.length() - 2);
        String out = "";
        String[] statements = source.split(";");
        for (int i = 0; i < statements.length; i++) {
            String stm = statements[i].trim();
            String result = "";
            if (stm.equals("now")) {
                result = Calendar.getInstance().getTime().toString();

            } else if (stm.startsWith("host")) {
                result = System.getProperty("os.name");

            } else if (stm.startsWith("sysinfo")) {
                Properties prop = System.getProperties();
                Enumeration<?> e = prop.propertyNames();
                while (e.hasMoreElements()) {
                    String key = (String) e.nextElement();
                    result += (key + ": " + prop.getProperty(key)) + "<br />";
                }
            }
            out += result;
        }
        return out;
    }

    private byte[] response200_processDir(File file) throws Exception, IOException {
        /* devolvendo o cinteúdo do diretório */
        String contentType = "text/html";

        /* processando conteudo do diretório */
        StringBuffer content = new StringBuffer();
        content.append("<!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 2.0//EN\"><html><head><title>");
        content.append("Listing content for directory " + this.requestPath);
        content.append("</title></head><body><h1>Index of " + this.requestPath + "</h1>");
        content.append("<pre><a href=''>Name</a>                        <a href=''>Last modified</a>      <a href=''>Size</a><hr>");
        for (File f : file.listFiles()) {
            content.append("<a href= '" + this.requestPath + "/" + f.getName() + "'>" + f.getName() + "</a>");
            Calendar lastModified = Calendar.getInstance();
            lastModified.setTimeInMillis(f.lastModified());
            content.append(new String(new char[25 - f.getName().length()]).replace("\0", " ") + "   ").append(DateFormat.getInstance().format(lastModified.getTime()));
            content.append("   ").append(f.length());
            content.append("<br>");
        }
        content.append("<hr></pre>");
        content.append("LuanTiagoServer/0.1.1b on ").append(requestHeader.get("Host:"));
        content.append("</body></html>");

        /* montando a resposta */
        String responseHeader = "HTTP/1.1 200 OK\n"
                + "Content-Length: " + content.length() + "\n"
                + "Content-Type: " + contentType + "\n"
                + "Set-Cookie: " + processCookieParams() + "\n"
                + "\n";

        /* enviando header e content da resposta */
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        result.write(responseHeader.getBytes());
        result.write(content.toString().getBytes());
        return result.toByteArray();
    }

    private byte[] response200_processFile(File file) throws Exception, IOException {
        /* devolvendo o arquivo */
        String contentType = contentType(file.getName());

        /* processando conteudo do arquivo */
        byte[] content;
        if (!contentType.equals("text/html")) {
            content = sendBytes(new FileInputStream(file));
        } else {
            content = processDynamicHtml(new FileReader(file));
        }

        /* montando a resposta */
        String responseHeader = "HTTP/1.1 200 OK\n"
                + "Content-Length: " + content.length + "\n"
                + "Content-Type: " + contentType + "\n"
                + "Set-Cookie: " + processCookieParams() + "\n"
                + "\n";

        /* enviando header e content da resposta */
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        result.write(responseHeader.getBytes());
        result.write(content);
        return result.toByteArray();
    }

    private byte[] processDynamicHtml(FileReader reader) {
        try {
            /* faz leitura do conteudo do arquivo */
            StringBuffer stringBuffer = new StringBuffer();
            int c = reader.read();
            while (c != -1) {
                stringBuffer.append((char) c);
                c = reader.read();
            }

            DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            Date date = new Date();

            /* INJETA o FOOTER com o counter */
            stringBuffer.append("<footer style='color:white;background:gray;border:1px solid #a29bc0;text-align:center;' title='This footer was dynamically appended by server into html files .' >");
            stringBuffer.append("You have accessed this server <b>" + cookieParams.get("counter") + "</b> times.");
            stringBuffer.append("Current Date:" + dateFormat.format(date) + "");
            stringBuffer.append("</footer>");

            /* Inicia o tratamento de SCRIPT */
            String content = stringBuffer.toString();

            /* faz o parsing da linguagem */
            Pattern p = Pattern.compile("<%.*?%>"); // expressao regular para trechos de codigo
            Matcher m = p.matcher(content);
            while (m.find()) {
                String script = m.group(); // codigo a executar
                String scriptOut = compileScript(script);

                /* Substitui o código compilado */
                content = content.replaceFirst(script, scriptOut);
            }
            return content.getBytes();

        } catch (IOException ex) {
            Logger.getLogger(RequesteHandle.class.getName()).log(Level.SEVERE, null, ex);
            return null;
        }
    }

    private static String contentType(String fileName) {
        if (fileName.endsWith(".htm") || fileName.endsWith(".html")) {
            return "text/html";
        }
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (fileName.endsWith(".gif")) {
            return "image/gif";
        }
        if (fileName.endsWith(".txt")) {
            return "text/plain";
        }
        if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        }
        if (fileName.endsWith(".css")) {
            return "text/css";
        }
        return "application/octet-stream";
    }
}
