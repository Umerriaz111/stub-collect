import React, { useState } from "react";
import { Box, Button, Grid, Stack } from "@mui/material";
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
import SearchIcon from "@mui/icons-material/Search";



const Filters = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);

  const handleSearch = () => {
    const filters = {};
    if (search) filters.title = search;
    if (minPrice) filters.min_price = minPrice;
    if (maxPrice) filters.max_price = maxPrice;
    if (dateRange[0]) filters.start_date = dayjs(dateRange[0]).format("YYYY-MM-DD");
    if (dateRange[1]) filters.end_date = dayjs(dateRange[1]).format("YYYY-MM-DD");
    onSearch(filters);
  };

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "transparent",
        borderRadius: 2,
      }}
    >
      <Grid
        container
        spacing={2}
        display={"flex"}
        justifyContent="center"
        alignItems="center"
      >
        {/* Search Field */}
        <Grid item xs={12} md={3}>
          <FormField
            label="Search"
            fullWidth
            placeholder="Search events..."
            type={"text"}
            id={"event-search"}
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Grid>

        {/* Price Range Fields */}
        <Grid item xs={12} md={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormField
              label="Min Price"
              type="number"
              fullWidth
              placeholder="Min"
              id={"min-price"}
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
            />
            <Box>-</Box>
            <FormField
              label="Max Price"
              type="number"
              fullWidth
              placeholder="Max"
              id={"max-price"}
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
            />
          </Stack>
        </Grid>

        {/* Date Range Picker */}
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["SingleInputDateRangeField"]}>
              <DateRangePicker
                calendars={1}
                slots={{ field: SingleInputDateRangeField }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                  actionBar: { actions: [] },
                }}
                name="allowedRange"
                value={dateRange}
                onChange={setDateRange}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Grid>

        {/* Search Button */}
        <Grid item xs={12} md={1} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            fullWidth
            sx={{ height: "40px" }}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Filters;
