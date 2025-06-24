import React from "react";
import { MenuItem, Select, FormControl, Typography, Grid } from "@mui/material";

const MUISelectShippingAccount = ({
  disabled,
  value = "",
  shipment,
  order,
  onChange,
  options = [],
  fontSize = "14px",
  borderRadius = "30px",
  sx = {},
  isTable = false,
}) => {
  if (!options.find((opt) => opt.id === value)) {
    const accNo = shipment?.shippingAccount?.accountNumber;
    const shippingAcc = options.find(
      (opt) => opt.accountNumber === accNo && opt.isDefault === true
    );
    value = shippingAcc?.id;
  }

  return (
    <FormControl sx={{ m: 0.5, minWidth: 100 }} fullWidth size="small">
      <Select
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e, shipment, order)}
        renderValue={() => {
          const selectedOption = options.find((opt) => opt.id === value);
          return selectedOption
            ? `${selectedOption?.accountNumber}, ${selectedOption?.category}, ${selectedOption?.address1}, ${selectedOption?.postalCode}`
            : "Shipping Account";
        }}
        sx={{
          borderRadius: borderRadius,
          fontSize: fontSize,
          ...sx,
        }}
        displayEmpty
      >
        <MenuItem value="" disabled sx={{ fontSize }}>
          Shipping Account
        </MenuItem>
        {options.map((option) => (
          <MenuItem
            key={option.id}
            value={option.id}
            data-testid="shipping-list-testid"
          >
            <Grid
              container
              display={"flex"}
              gap={2}
              sx={{ fontSize: fontSize ? fontSize : "14px" }}
            >
              <Grid item xs={isTable ? 2.3 : 2.5}>
                <Typography sx={{ fontSize }}>
                  {option?.accountNumber}
                </Typography>
              </Grid>
              <Grid item xs={isTable ? 1.5 : 2}>
                <Typography
                  sx={{
                    fontSize,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                    width: "100%",
                  }}
                >
                  {option?.category}
                </Typography>
              </Grid>
              <Grid item xs={4.5}>
                <Typography
                  sx={{
                    fontSize,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                    width: "100%",
                  }}
                >
                  {option?.address1}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography sx={{ fontSize }}>{option?.postalCode}</Typography>
              </Grid>
            </Grid>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MUISelectShippingAccount;
