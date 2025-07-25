import { Button } from "@mui/material";
import React from "react";
import { useSearchParams } from "react-router-dom";

const SellerOnBoarding = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");

  return (
    <div>
      {" "}
      url = {url}
      <Button
        variant="contained"
        color="primary"
        sx={{ m: 4 }}
        onClick={() => {
          window.open(url);
        }}
      >
        start onboarding
      </Button>
    </div>
  );
};

export default SellerOnBoarding;
