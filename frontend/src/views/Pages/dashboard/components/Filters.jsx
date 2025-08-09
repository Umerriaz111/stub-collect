import { Box, Grid } from "@mui/material";
import React from "react";
import { LicenseInfo } from "@mui/x-license";
LicenseInfo.setLicenseKey(
  "e0d9bb8070ce0054c9d9ecb6e82cb58fTz0wLEU9MzI0NzIxNDQwMDAwMDAsUz1wcmVtaXVtLExNPXBlcnBldHVhbCxLVj0y"
);
import FormField from "../../../components/MUITextFiled/FormField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const Filters = () => {
  return (
    <Grid
      container
      mb={4}
      display={"flex"}
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={4} md={2} px={1}>
        <FormField
          label="Search"
          fullWidth
          placeholder="Search by date"
          type={"text"}
          id={"title-search"}
          //   value={""}
        />
      </Grid>

      <Grid item xs={4} md={2} px={1}>
        <FormField
          label="Price Range"
          type="number"
          fullWidth
          placeholder="Search by price"
          id={"title-search"}
          //   value={""}
        />
      </Grid>
      <Grid
        item
        xs={4}
        md={3}
        px={1}
        sx={{
          "& .MuiInputBase-root": {
            borderRadius: "100px",
          },
          "& .MuiInputBase-input": {
            padding: "8px",
          },
          "& .MuiStack-root": {
            paddingTop: "0px",
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={["SingleInputDateRangeField"]}>
            <DateRangePicker
              calendars={1}
              slots={{ field: SingleInputDateRangeField }}
              slotProps={{
                // shortcuts: {
                //   items: shortcutsItems,
                // },
                actionBar: { actions: [] },
              }}
              name="allowedRange"
              //   onChange={handleRangeChange}
              // sx={pickerPadding}
            />
          </DemoContainer>
        </LocalizationProvider>
      </Grid>
    </Grid>
  );
};

export default Filters;
