package com.trustXchange.dao.p2p;

import java.sql.*;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import com.trustXchange.dto.p2p.P2PLendingRequestDTO;

public class P2PLendingRequestDAO {
    private Connection connection;

    public P2PLendingRequestDAO(Connection connection) {
        this.connection = connection;
    }

    public void createLendingRequest(P2PLendingRequestDTO request) throws SQLException {
        String sql = "INSERT INTO lending_requests (lender, amount_to_lend_usd, amount_lended_usd, min_collateral_ratio, liquidation_threshold, desired_interest_rate, payment_duration, minimal_partial_fill, canceled, canceled_by_system) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, request.getLender());
            stmt.setBigDecimal(2, request.getAmountToLendUSD());
            stmt.setBigDecimal(3, request.getAmountLendedUSD());
            stmt.setBigDecimal(4, request.getMinCollateralRatio());
            stmt.setBigDecimal(5, request.getLiquidationThreshold());
            stmt.setBigDecimal(6, request.getDesiredInterestRate());
            stmt.setLong(7, request.getPaymentDuration().getSeconds());
            stmt.setBigDecimal(8, request.getMinimalPartialFill());
            stmt.setBoolean(9, request.isCanceled());
            stmt.setBoolean(10, request.isCanceledBySystem());
            stmt.executeUpdate();
        }
    }

    public P2PLendingRequestDTO getLendingRequestById(int requestId) throws SQLException {
        String sql = "SELECT * FROM lending_requests WHERE request_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, requestId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new P2PLendingRequestDTO(
                        rs.getInt("request_id"),
                        rs.getString("lender"),
                        rs.getBigDecimal("amount_to_lend_usd"),
                        rs.getBigDecimal("amount_lended_usd"),
                        rs.getBigDecimal("min_collateral_ratio"),
                        rs.getBigDecimal("liquidation_threshold"),
                        rs.getBigDecimal("desired_interest_rate"),
                        Duration.ofSeconds(rs.getLong("payment_duration")),
                        rs.getBigDecimal("minimal_partial_fill"),
                        rs.getBoolean("canceled"),
                        rs.getBoolean("canceled_by_system")
                    );
                }
            }
        }
        return null;
    }

    public List<P2PLendingRequestDTO> getAllLendingRequests() throws SQLException {
        List<P2PLendingRequestDTO> requests = new ArrayList<>();
        String sql = "SELECT * FROM lending_requests";
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                P2PLendingRequestDTO request = new P2PLendingRequestDTO(
                    rs.getInt("request_id"),
                    rs.getString("lender"),
                    rs.getBigDecimal("amount_to_lend_usd"),
                    rs.getBigDecimal("amount_lended_usd"),
                    rs.getBigDecimal("min_collateral_ratio"),
                    rs.getBigDecimal("liquidation_threshold"),
                    rs.getBigDecimal("desired_interest_rate"),
                    Duration.ofSeconds(rs.getLong("payment_duration")),
                    rs.getBigDecimal("minimal_partial_fill"),
                    rs.getBoolean("canceled"),
                    rs.getBoolean("canceled_by_system")
                );
                requests.add(request);
            }
        }
        return requests;
    }

    public void updateLendingRequest(P2PLendingRequestDTO request) throws SQLException {
        String sql = "UPDATE lending_requests SET lender = ?, amount_to_lend_usd = ?, amount_lended_usd = ?, min_collateral_ratio = ?, liquidation_threshold = ?, desired_interest_rate = ?, payment_duration = ?, minimal_partial_fill = ?, canceled = ?, canceled_by_system = ? WHERE request_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, request.getLender());
            stmt.setBigDecimal(2, request.getAmountToLendUSD());
            stmt.setBigDecimal(3, request.getAmountLendedUSD());
            stmt.setBigDecimal(4, request.getMinCollateralRatio());
            stmt.setBigDecimal(5, request.getLiquidationThreshold());
            stmt.setBigDecimal(6, request.getDesiredInterestRate());
            stmt.setLong(7, request.getPaymentDuration().getSeconds());
            stmt.setBigDecimal(8, request.getMinimalPartialFill());
            stmt.setBoolean(9, request.isCanceled());
            stmt.setBoolean(10, request.isCanceledBySystem());
            stmt.setInt(11, request.getRequestId());
            stmt.executeUpdate();
        }
    }

    public void deleteLendingRequest(int requestId) throws SQLException {
        String sql = "DELETE FROM lending_requests WHERE request_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, requestId);
            stmt.executeUpdate();
        }
    }
}