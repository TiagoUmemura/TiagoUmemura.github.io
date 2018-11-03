package webserver;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.InetAddress;
import java.net.MulticastSocket;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Multicast implements Runnable{
	private final MulticastSocket mSocket;
	private final String host;
	private final int port;
	private final InetAddress group;
	private HashMap<String, String> friendlyHosts;

	public Multicast() throws IOException, InterruptedException {
		
		this.host = "225.1.2.3";
		this.port = 8889;
		this.group = InetAddress.getByName(this.host);
		mSocket = new MulticastSocket(this.port);
		mSocket.joinGroup(this.group);
		this.friendlyHosts = new HashMap<>();
	}
	
	private void clientMulticast(String message) throws IOException {
		byte[] msgByte = message.getBytes();
		DatagramPacket msgDataOut = new DatagramPacket(msgByte,  msgByte.length, this.group, this.port);
		mSocket.send(msgDataOut);
	}
	
	public void serverMulticast() throws IOException, InterruptedException {
		String ipFriendly = new String();
		String msg = new String();
		//System.out.println("Servidor Multicast iniciado");
		while(true) {
                        System.out.println("Entrou Servidor");
			byte[] msgByte = new byte[1000];
			DatagramPacket msgDataIn = new DatagramPacket(msgByte, msgByte.length);
			mSocket.receive(msgDataIn);
			msg = new String(msgDataIn.getData()).trim();
                        //ip da msg recebida
			ipFriendly = msgDataIn.getAddress().getHostAddress();
			
			//if (!friendlyHosts.containsKey(ipFriendly)){
			friendlyHosts.put(ipFriendly, msg);
			//}
			System.out.println("Hosts: "+friendlyHosts);
		}
	}
	
	public void sendMessage(String message) throws IOException {
		clientMulticast(message);
	}

	public HashMap<String, String> getFriendlyHosts() {
		return friendlyHosts;
	}

    @Override
    public void run() {
            try {
                this.serverMulticast();
            } catch (IOException ex) {
                Logger.getLogger(Multicast.class.getName()).log(Level.SEVERE, null, ex);
            } catch (InterruptedException ex) {
                Logger.getLogger(Multicast.class.getName()).log(Level.SEVERE, null, ex);
            }
    }
}