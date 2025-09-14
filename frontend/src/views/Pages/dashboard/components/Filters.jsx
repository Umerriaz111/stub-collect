import React, { useState } from "react";
import { Box, Button, Grid, Stack, IconButton } from "@mui/material";
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
import CloseIcon from "@mui/icons-material/Close";

const Filters = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);

  const isFilterSet =
    !!search || !!minPrice || !!maxPrice || !!dateRange[0] || !!dateRange[1];

  const handleSearch = () => {
    const filters = {};
    if (search) filters.title = search;
    if (minPrice) filters.min_price = minPrice;
    if (maxPrice) filters.max_price = maxPrice;
    if (dateRange[0])
      filters.start_date = dayjs(dateRange[0]).format("YYYY-MM-DD");
    if (dateRange[1])
      filters.end_date = dayjs(dateRange[1]).format("YYYY-MM-DD");
    onSearch(filters);
  };

  const handleClear = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setDateRange([null, null]);
    onSearch({});
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
        <Grid item xs={12} md={6} lg={3}>
          <Box
            sx={{ display: "flex", alignItems: "center", position: "relative" }}
          >
            <FormField
              label="Search"
              fullWidth
              placeholder="Search events..."
              type={"text"}
              id={"event-search"}
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                endAdornment: search && (
                  <IconButton
                    size="small"
                    onClick={() => setSearch("")}
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    aria-label="clear search"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Grid>

        {/* Price Range Fields */}
        <Grid item xs={12} md={6} lg={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <FormField
                label="Min Price"
                type="number"
                fullWidth
                placeholder="Min"
                id={"min-price"}
                size="small"
                InputProps={{
                  inputProps: { min: 0 },
                  endAdornment: minPrice && (
                    <IconButton
                      size="small"
                      onClick={() => setMinPrice("")}
                      sx={{
                        position: "absolute",
                        right: 30,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                      aria-label="clear min price"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </Box>
            <Box>-</Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <FormField
                label="Max Price"
                type="number"
                fullWidth
                placeholder="Max"
                id={"max-price"}
                size="small"
                InputProps={{
                  inputProps: { min: 0 },
                  endAdornment: maxPrice && (
                    <IconButton
                      size="small"
                      onClick={() => setMaxPrice("")}
                      sx={{
                        position: "absolute",
                        right: 30,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                      aria-label="clear max price"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </Box>
          </Stack>
        </Grid>

        {/* Date Range Picker */}
        <Grid
          item
          xs={12}
          md={6}
          lg={4}
          sx={{
            ".MuiPaper-root": {
              backgroundColor: "red",
            },
          }}
        >
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
                  field: {
                    clearable: true,
                    onClear: () => setDateRange([null, null]),
                  },
                }}
                name="allowedRange"
                value={dateRange}
                onChange={setDateRange}
                // Add a clear button for the date picker
                renderInput={(params) => (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <SingleInputDateRangeField {...params} />
                    {(dateRange[0] || dateRange[1]) && (
                      <Button
                        size="small"
                        onClick={() => setDateRange([null, null])}
                        sx={{ ml: 1 }}
                      >
                        Clear
                      </Button>
                    )}
                  </Box>
                )}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Grid>

        {/* Search Button */}
        <Grid
          item
          xs={12}
          md={3}
          lg={2}
          gap={1}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            fullWidth
            sx={{ height: "40px" }}
            onClick={handleSearch}
            disabled={!isFilterSet}
          >
            Search
          </Button>
          <Button
            color="secondary"
            fullWidth
            onClick={handleClear}
            disabled={!isFilterSet}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Filters;
