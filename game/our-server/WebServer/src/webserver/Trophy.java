/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package webserver;

/**
 *
 * @author tiago
 */
//{"id":"2","op":"add-trophy", data: {"name": "10 coins", "xp": "30", "title": "IT\'S A START","description": "Collected first 10 coins on the game"}}
public class Trophy {
    public String id;
    public String op;
    public Data data;
    
    public class Data
    {
        public String name;
        public String xp;
        public String title;
        public String description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOp() {
        return op;
    }

    public void setOp(String op) {
        this.op = op;
    }
    
    
}
