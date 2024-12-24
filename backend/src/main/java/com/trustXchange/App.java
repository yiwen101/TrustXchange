// App.java
package com.trustXchange;

public class App 
{
    public static void main(String[] args)
    {
        try {
            EventListener.listenFor(5);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}