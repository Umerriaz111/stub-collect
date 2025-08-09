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
          "url(https://sdmntprwestcentralus.oaiusercontent.com/files/00000000-3808-61fb-9e76-cef80909f515/raw?se=2025-08-09T13%3A28%3A53Z&sp=r&sv=2024-08-04&sr=b&scid=638da1c4-2a13-57ab-90df-76f1f892bf63&skoid=a3412ad4-1a13-47ce-91a5-c07730964f35&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-08-09T08%3A05%3A30Z&ske=2025-08-10T08%3A05%3A30Z&sks=b&skv=2024-08-04&sig=F3pmzZC5/iJpYnjODTw1Dex51jzvRIVwBZVGvR2SYq8%3D)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "98vh",
        paddingTop: "1rem",
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
