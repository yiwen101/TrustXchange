package com.trustXchange.dao.p2p;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;


import com.trustXchange.dto.p2p.P2PLendingRequestFilledDTO;

public class P2PLendingingRequestFilledDAO {
     private Connection connection;

    public P2PLendingingRequestFilledDAO(Connection connection) {
        this.connection = connection;
    }

    public void insert(P2PLendingRequestFilledDTO request) throws SQLException {
        String query = "INSERT INTO p2p_lending_request_filled (request_id, loan_id) VALUES (?, ?)";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, request.getRequestId());
            statement.setInt(2, request.getLoanId());
            statement.executeUpdate();
        }
    }

    public List<Integer> getLoanIdsByRequestId(int requestId) throws SQLException {
        String query = "SELECT loan_id FROM p2p_lending_request_filled WHERE request_id = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, requestId);
            try (ResultSet resultSet = statement.executeQuery()) {
                List<Integer> loanIds = new ArrayList<>();
                while (resultSet.next()) {
                    loanIds.add(resultSet.getInt("loan_id"));
                }
                return loanIds;
            }
        }
    }
}
