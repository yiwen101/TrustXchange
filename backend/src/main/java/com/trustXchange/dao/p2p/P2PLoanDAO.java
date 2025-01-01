package com.trustXchange.dao.p2p;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.trustXchange.dto.p2p.P2PLoanDTO;

public class P2PLoanDAO {
    private Connection connection;

    public P2PLoanDAO(Connection connection) {
        this.connection = connection;
    }

    public void createLoan(P2PLoanDTO loan) throws SQLException {
        String sql = "INSERT INTO loans (loan_id, lender, borrower, amount_borrowed_usd, amount_payable_to_lender, amount_payable_to_platform, amount_paid_usd, collateral_amount_xrp, repay_by, liquidation_threshold, is_liquidated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, loan.getLoanId());
            stmt.setString(2, loan.getLender());
            stmt.setString(3, loan.getBorrower());
            stmt.setBigDecimal(4, loan.getAmountBorrowedUSD());
            stmt.setBigDecimal(5, loan.getAmountPayableToLender());
            stmt.setBigDecimal(6, loan.getAmountPayableToPlatform());
            stmt.setBigDecimal(7, loan.getAmountPaidUSD());
            stmt.setBigDecimal(8, loan.getCollateralAmountXRP());
            stmt.setTimestamp(9, Timestamp.from(loan.getRepayBy()));
            stmt.setBigDecimal(10, loan.getLiquidationThreshold());
            stmt.setBoolean(11, loan.isLiquidated());
            stmt.executeUpdate();
        }
    }

    public P2PLoanDTO getLoanById(int loanId) throws SQLException {
        String sql = "SELECT * FROM loans WHERE loan_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, loanId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new P2PLoanDTO(
                        rs.getInt("loan_id"),
                        rs.getString("lender"),
                        rs.getString("borrower"),
                        rs.getBigDecimal("amount_borrowed_usd"),
                        rs.getBigDecimal("amount_payable_to_lender"),
                        rs.getBigDecimal("amount_payable_to_platform"),
                        rs.getBigDecimal("amount_paid_usd"),
                        rs.getBigDecimal("collateral_amount_xrp"),
                        rs.getTimestamp("repay_by").toInstant(),
                        rs.getBigDecimal("liquidation_threshold"),
                        rs.getBoolean("is_liquidated")
                    );
                }
            }
        }
        return null;
    }

    public List<P2PLoanDTO> getAllLoans() throws SQLException {
        List<P2PLoanDTO> loans = new ArrayList<>();
        String sql = "SELECT * FROM loans";
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                P2PLoanDTO loan = new P2PLoanDTO(
                    rs.getInt("loan_id"),
                    rs.getString("lender"),
                    rs.getString("borrower"),
                    rs.getBigDecimal("amount_borrowed_usd"),
                    rs.getBigDecimal("amount_payable_to_lender"),
                    rs.getBigDecimal("amount_payable_to_platform"),
                    rs.getBigDecimal("amount_paid_usd"),
                    rs.getBigDecimal("collateral_amount_xrp"),
                    rs.getTimestamp("repay_by").toInstant(),
                    rs.getBigDecimal("liquidation_threshold"),
                    rs.getBoolean("is_liquidated")
                );
                loans.add(loan);
            }
        }
        return loans;
    }

    public void updateLoan(P2PLoanDTO loan) throws SQLException {
        String sql = "UPDATE loans SET lender = ?, borrower = ?, amount_borrowed_usd = ?, amount_payable_to_lender = ?, amount_payable_to_platform = ?, amount_paid_usd = ?, collateral_amount_xrp = ?, repay_by = ?, liquidation_threshold = ?, is_liquidated = ? WHERE loan_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, loan.getLender());
            stmt.setString(2, loan.getBorrower());
            stmt.setBigDecimal(3, loan.getAmountBorrowedUSD());
            stmt.setBigDecimal(4, loan.getAmountPayableToLender());
            stmt.setBigDecimal(5, loan.getAmountPayableToPlatform());
            stmt.setBigDecimal(6, loan.getAmountPaidUSD());
            stmt.setBigDecimal(7, loan.getCollateralAmountXRP());
            stmt.setTimestamp(8, Timestamp.from(loan.getRepayBy()));
            stmt.setBigDecimal(9, loan.getLiquidationThreshold());
            stmt.setBoolean(10, loan.isLiquidated());
            stmt.setInt(11, loan.getLoanId());
            stmt.executeUpdate();
        }
    }

    public void deleteLoan(int loanId) throws SQLException {
        String sql = "DELETE FROM loans WHERE loan_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, loanId);
            stmt.executeUpdate();
        }
    }
}