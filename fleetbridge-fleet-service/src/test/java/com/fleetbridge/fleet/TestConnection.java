package com.fleetbridge.fleet;

import java.sql.Connection;
import java.sql.DriverManager;

public class TestConnection {
    public static void main(String[] args) {
        String[] users = {"fleetbridge_user", "postgres", "root", "admin"};
        String[] passes = {"fleetbridge_password", "postgres", "root", "admin", "password", ""};
        String[] dbs = {"fleetbridge_fleet_db", "fleetbridge_master", "postgres"};

        for (String user : users) {
            for (String pass : passes) {
                for (String db : dbs) {
                    String url = "jdbc:postgresql://127.0.0.1:5432/" + db;
                    try (Connection conn = DriverManager.getConnection(url, user, pass)) {
                        System.out.println("=================================================");
                        System.out.println(">>> SUCCESS! Connected with user='" + user + "', pass='" + pass + "', db='" + db + "' <<<");
                        System.out.println("=================================================");
                        return;
                    } catch (Exception e) {
                        // ignore and try next
                    }
                }
            }
        }
        System.out.println("=================================================");
        System.out.println(">>> FAILED: None of the credential combinations worked. <<<");
        System.out.println("=================================================");
    }
}
