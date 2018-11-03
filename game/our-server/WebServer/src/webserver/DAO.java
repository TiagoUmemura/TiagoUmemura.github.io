package webserver;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class DAO {

    private static final String url = "jdbc:mysql://localhost:3306/";
    private static final String dbName = "web";
    private static final String driver = "com.mysql.jdbc.Driver";
    private static final String userName = "root";
    private static final String password = "root";

    public static boolean addPlayer(Player player) {
        Connection conexao = null;
        PreparedStatement pst = null;
        ResultSet rs = null;

        try {
            Class.forName(driver).newInstance();
            conexao = DriverManager.getConnection(url + dbName, userName, password);
            Statement statement = conexao.createStatement();
            String sql = "INSERT INTO player(id,password, email) VALUES ( '" + (player.data.email + player.data.password) + "','" + player.data.password + "','" + player.data.email + "');";

            statement.execute(sql);
            statement.close();
            return true;

        } catch (Exception ex) {
            System.out.println("Erro : " + ex.getMessage());
            return false;
        }
    }

    public static boolean veifyPlayerPassword(Player player) throws ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        Connection conexao = null;
        PreparedStatement pst = null;
        ResultSet rs = null;

        Class.forName(driver).newInstance();
        conexao = DriverManager.getConnection(url + dbName, userName, password);

        pst = conexao.prepareStatement("SELECT password FROM player WHERE email='" + player.data.email + "'");
        rs = pst.executeQuery();

        if (rs.next()) {
            if (rs.getString("password").compareTo(player.data.password) == 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public static boolean verifyPlayerLogin(Player player) throws ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        Connection conexao = null;
        PreparedStatement pst = null;
        ResultSet rs = null;

        Class.forName(driver).newInstance();
        conexao = DriverManager.getConnection(url + dbName, userName, password);

        pst = conexao.prepareStatement("SELECT * FROM player WHERE email='" + player.data.email + "'");
        rs = pst.executeQuery();

        if (rs.next()) {
            return true;
        } else {
            return false;
        }

    }

    public static String getPlayer() throws ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        Connection conexao = null;
        PreparedStatement pst = null;
        ResultSet rs = null;

        Class.forName(driver).newInstance();
        conexao = DriverManager.getConnection(url + dbName, userName, password);
        pst = conexao.prepareStatement("select * from player ");

        rs = pst.executeQuery();
        String aux = "";
        while (rs.next()) {
            aux = "{id:" + String.valueOf(rs.getInt("idplayer"));
            aux += ", password:" + rs.getString("password");
            aux += ", email:" + rs.getString("email") + "}";
        }
        return aux;
    }

    public static String getCoordinates(Player player) {

        Connection conexao = null;
        PreparedStatement pst = null;
        ResultSet rs = null;
        String returnString = "";
        System.out.println("GetCoords");
        System.out.println("Player: " + (player.data.email + player.data.password));

        try {
            Class.forName(driver).newInstance();
            conexao = DriverManager.getConnection(url + dbName, userName, password);
            Statement statement = conexao.createStatement();
            String sql = "SELECT * FROM coord WHERE id='" + (player.data.email + player.data.password) + "'";

            rs = statement.executeQuery(sql);

            while (rs.next()) {
                returnString += "\"x\":" + rs.getString("x") + ",\"y\":" + rs.getString("y");
            }

            return returnString;
        } catch (Exception ex) {
            System.out.println("Erro : " + ex.getMessage());
            return "";
        }

    }

    public static boolean updateCoordinates(SaveState save) throws ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {

        Connection conexao = null;
        PreparedStatement pst = null;
        ResultSet rs = null;

        try {
            Class.forName(driver).newInstance();
            conexao = DriverManager.getConnection(url + dbName, userName, password);
            Statement statement = conexao.createStatement();
            String sql = "INSERT INTO coord(x,y,id) VALUES (" + save.data.x + ",'" + save.data.y + "','" + save.id + "')"
                    + "ON DUPLICATE KEY UPDATE x = VALUES(x),y = VALUES(y),id = VALUES(id);";

            statement.execute(sql);
            statement.close();
            return true;

        } catch (Exception ex) {
            System.out.println("Erro : " + ex.getMessage());
            return false;
        }
    }

    public static boolean verifyTrophy(String idplayer, String nameTrophy) throws ClassNotFoundException, SQLException, InstantiationException, IllegalAccessException {

        Connection conexao = null;
        PreparedStatement pst = null;
        ResultSet rs = null;

        Class.forName(driver).newInstance();
        conexao = DriverManager.getConnection(url + dbName, userName, password);
        pst = conexao.prepareStatement("SELECT * from trophy WHERE idplayer='" + idplayer + "' AND name='" + nameTrophy + "'");
        rs = pst.executeQuery();

        if (rs.next()) {
            return true;
        } else {
            return false;
        }
    }

    public static String listTrophy(Player player) {

        Connection conexao = null;
        PreparedStatement pst = null;
        ResultSet rs = null;
        String returnString = "";

        try {
            Class.forName(driver).newInstance();
            conexao = DriverManager.getConnection(url + dbName, userName, password);
            Statement statement = conexao.createStatement();
            String sql = "SELECT * FROM trophy WHERE idplayer='" + (player.data.email + player.data.password) + "'";

            rs = statement.executeQuery(sql);

            while (rs.next()) {
                returnString
                        += "{\"name\":\""
                        + rs.getString("name") + "\","
                        + "\"xp\":"
                        + rs.getString("xp") + ","
                        + "\"title\":\""
                        + rs.getString("title") + "\","
                        + "\"description\":\""
                        + rs.getString("description") + "\"},";
            }
            //System.out.println(returnString);
            returnString = returnString.substring(0, returnString.length() - 1);
            System.out.println(returnString);
            return returnString;
        } catch (Exception ex) {
            System.out.println("Erro : " + ex.getMessage());
            return "";
        }
    }

    public static boolean addTrophy(Trophy trophy) {
        Connection conexao = null;
        PreparedStatement pst = null;
        ResultSet rs = null;

        try {
            Class.forName(driver).newInstance();
            conexao = DriverManager.getConnection(url + dbName, userName, password);
            Statement statement = conexao.createStatement();
            String sql = "INSERT INTO trophy(name, xp, title, description, idplayer) VALUES ( '" + trophy.data.name + "'," + trophy.data.xp + ",'" + trophy.data.title + "','" + trophy.data.description + "','" + trophy.id + "');";
            statement.execute(sql);
            statement.close();
            return true;

        } catch (Exception ex) {
            System.out.println("Erro : " + ex.getMessage());
            return false;
        }
    }

}
