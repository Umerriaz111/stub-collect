import React, { Suspense } from "react";
import Box from "@mui/system/Box";
import ComponentLoader from "../Loaders/ComponentLoader";
import MainHeader from "../Headers/MainHeader";
const PageWrapper = ({ children, isSidebar }) => {
  return (
    <Box
      // sx={{
      //     // height: isSidebar ? 'calc(100vh - 80px)' : '100%',
      //     height: isSidebar ? '100vh' : '100vh',
      //     overflow: 'auto',
      //     paddingTop: '1rem',
      //     paddingX: '10px',
      //     backgroundColor: 'primary.lightBG',
      // }}
      sx={{
        backgroundImage:
          "url(https://sdmntprwestcentralus.oaiusercontent.com/files/00000000-3808-61fb-9e76-cef80909f515/raw?se=2025-08-09T17%3A36%3A01Z&sp=r&sv=2024-08-04&sr=b&scid=bee0be3a-7dbc-5b53-9d72-713376393e84&skoid=bbd22fc4-f881-4ea4-b2f3-c12033cf6a8b&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-08-09T16%3A08%3A24Z&ske=2025-08-10T16%3A08%3A24Z&sks=b&skv=2024-08-04&sig=hKo0FVgBwV8Wm1npJ9AXbOEFbSPV2sy45WMAVJO8bIE%3D)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        // paddingTop: "1rem",
      }}
    >
      {/* <Suspense fallback={<ComponentLoader />}>
        <MainHeader />
        <Box>{children}</Box>
      </Suspense> */}
      {children}
    </Box>
  );
};

export default PageWrapper;
