import React from "react";
import { Alert, Box, Typography } from "@mui/material";
import { useXrpPriceValue } from "../hooks/usePriceState";

const PriceInfo: React.FC = () => {
    const { xrpPrice, xrpPriceYesterday} = useXrpPriceValue();
    const current_price_2dp = xrpPrice ? xrpPrice.toFixed(2) : '0.00'
    const price_diff = xrpPrice && xrpPriceYesterday ? xrpPrice - xrpPriceYesterday : 0
    const price_diff_2dp = price_diff.toFixed(2)
    return (xrpPrice&&xrpPriceYesterday) ? (
        <Box>
          <Alert severity="info">
            XRP = {current_price_2dp} USD{"   "}
            <Typography
              variant="body2"
              component="span"
              style={{ color: price_diff > 0 ? 'green' : 'red' }}
            >
              {price_diff_2dp} since yesterday
            </Typography>
          </Alert>
        </Box>) : 
        (xrpPrice&&!xrpPriceYesterday) 
        ? (<Box>
        <Alert severity="info">
          XRP = {current_price_2dp} USD{"   "}
        </Alert>
        </Box>)
        :(
            <Box>
                <Alert severity="info">
                    Loading XRP price data...
                </Alert> 
            </Box>
        );
}

export default PriceInfo;
