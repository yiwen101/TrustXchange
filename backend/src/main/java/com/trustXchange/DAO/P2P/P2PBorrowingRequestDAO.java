package com.trustXchange.DAO.P2P;

import com.trustXchange.DTO.P2P.P2PBorrowingRequestDTO;
import java.sql.*;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

public class P2PBorrowingRequestDAO {
    private Connection connection;

    public P2PBorrowingRequestDAO(Connection connection) {
        this.connection = connection;
    }

    public void createBorrowingRequest(P2PBorrowingRequestDTO request) throws SQLException {
        String sql = "INSERT INTO borrowing_requests (request_id, borrower, amount_to_borrow_usd, amount_borrowed_usd, initial_collateral_amount_xrp, existing_collateral_amount_xrp, max_collateral_ratio, liquidation_threshold, desired_interest_rate, payment_duration, minimal_partial_fill, canceled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, request.getRequestId());
            stmt.setString(2, request.getBorrower());
            stmt.setDouble(3, request.getAmountToBorrowUSD());
            stmt.setDouble(4, request.getAmountBorrowedUSD());
            stmt.setDouble(5, request.getInitialCollateralAmountXRP());
            stmt.setDouble(6, request.getExistingCollateralAmountXRP());
            stmt.setDouble(7, request.getMaxCollateralRatio());
            stmt.setDouble(8, request.getLiquidationThreshold());
            stmt.setDouble(9, request.getDesiredInterestRate());
            stmt.setLong(10, request.getPaymentDuration().getSeconds());
            stmt.setDouble(11, request.getMinimalPartialFill());
            stmt.setBoolean(12, request.isCanceled());
            stmt.executeUpdate();
        }
    }

    public P2PBorrowingRequestDTO getBorrowingRequestById(int requestId) throws SQLException {
        String sql = "SELECT * FROM borrowing_requests WHERE request_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, requestId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new P2PBorrowingRequestDTO(
                        rs.getInt("request_id"),
                        rs.getString("borrower"),
                        rs.getDouble("amount_to_borrow_usd"),
                        rs.getDouble("amount_borrowed_usd"),
                        rs.getDouble("initial_collateral_amount_xrp"),
                        rs.getDouble("existing_collateral_amount_xrp"),
                        rs.getDouble("max_collateral_ratio"),
                        rs.getDouble("liquidation_threshold"),
                        rs.getDouble("desired_interest_rate"),
                        Duration.ofSeconds(rs.getLong("payment_duration")),
                        rs.getDouble("minimal_partial_fill"),
                        rs.getBoolean("canceled")
                    );
                }
            }
        }
        return null;
    }

    public List<P2PBorrowingRequestDTO> getAllBorrowingRequests() throws SQLException {
        List<P2PBorrowingRequestDTO> requests = new ArrayList<>();
        String sql = "SELECT * FROM borrowing_requests";
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                P2PBorrowingRequestDTO request = new P2PBorrowingRequestDTO(
                    rs.getInt("request_id"),
                    rs.getString("borrower"),
                    rs.getDouble("amount_to_borrow_usd"),
                    rs.getDouble("amount_borrowed_usd"),
                    rs.getDouble("initial_collateral_amount_xrp"),
                    rs.getDouble("existing_collateral_amount_xrp"),
                    rs.getDouble("max_collateral_ratio"),
                    rs.getDouble("liquidation_threshold"),
                    rs.getDouble("desired_interest_rate"),
                    Duration.ofSeconds(rs.getLong("payment_duration")),
                    rs.getDouble("minimal_partial_fill"),
                    rs.getBoolean("canceled")
                );
                requests.add(request);
            }
        }
        return requests;
    }

    public void updateBorrowingRequest(P2PBorrowingRequestDTO request) throws SQLException {
        String sql = "UPDATE borrowing_requests SET borrower = ?, amount_to_borrow_usd = ?, amount_borrowed_usd = ?, initial_collateral_amount_xrp = ?, existing_collateral_amount_xrp = ?, max_collateral_ratio = ?, liquidation_threshold = ?, desired_interest_rate = ?, payment_duration = ?, minimal_partial_fill = ?, canceled = ? WHERE request_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, request.getBorrower());
            stmt.setDouble(2, request.getAmountToBorrowUSD());
            stmt.setDouble(3, request.getAmountBorrowedUSD());
            stmt.setDouble(4, request.getInitialCollateralAmountXRP());
            stmt.setDouble(5, request.getExistingCollateralAmountXRP());
            stmt.setDouble(6, request.getMaxCollateralRatio());
            stmt.setDouble(7, request.getLiquidationThreshold());
            stmt.setDouble(8, request.getDesiredInterestRate());
            stmt.setLong(9, request.getPaymentDuration().getSeconds());
            stmt.setDouble(10, request.getMinimalPartialFill());
            stmt.setBoolean(11, request.isCanceled());
            stmt.setInt(12, request.getRequestId());
            stmt.executeUpdate();
        }
    }

    public void deleteBorrowingRequest(int requestId) throws SQLException {
        String sql = "DELETE FROM borrowing_requests WHERE request_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, requestId);
            stmt.executeUpdate();
        }
    }
}