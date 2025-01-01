// App.java
package com.trustXchange;

import com.trustXchange.Service.P2P.P2PEventListener;

public class App 
{
    public static void main(String[] args)
    {
        try {
            P2PEventListener.listenFor(5);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}