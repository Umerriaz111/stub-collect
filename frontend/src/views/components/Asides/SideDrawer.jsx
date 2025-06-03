import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import MenuIcon from "@mui/icons-material/Menu";
import {
  LocalShippingOutlined,
  Receipt,
  Settings,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import {
  Toolbar,
  Typography,
  useMediaQuery,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Collapse,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
// import { theme } from '../../../App'
import { useDispatch } from "react-redux";
import { TOGGLE_SIDEBAR } from "../../../core/store/App/appSlice";
import { useSelector } from "react-redux";
import { lightTheme } from "../../../core/theme/theme";
import { darkTheme } from "../../../core/theme/theme";

const drawerWidth = "13.33%";

const list = [
  { name: "Shipments", icon: <LocalShippingOutlined />, path: "/shipments" },

  {
    name: "Settings",
    icon: <Settings />,
    path: "/setting",
    subItems: [
      { name: "Carrier Account", icon: <Receipt />, path: "/setting/carrier" },
      { name: "Web Store", path: "/setting/webstore" },
      { name: "Printing Template", path: "/setting/printingTemplate" },
    ],
  },
];

function SideDrawer() {
  const location = useLocation();
  const [openSubItems, setOpenSubItems] = React.useState({});
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const mobileOpen = useSelector((state) => state.app.isSidebarOpen);
  const dispatch = useDispatch();

  const themeMode = useSelector((state) => state?.app?.themeMode);

  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  const handleDrawerToggle = () => {
    dispatch(TOGGLE_SIDEBAR());
  };

  const handleSubItemsToggle = (itemName) => {
    setOpenSubItems((prevState) => ({
      ...prevState,
      [itemName]: !prevState[itemName],
    }));
  };

  // for selected menu
  const menuItemMatch = (item) => {
    return (
      !item?.subItems &&
      (location.pathname === item.path ||
        (item.path !== "/" && location.pathname.startsWith(item.path)))
    );
  };

  const menuSubItemMatch = (subItem) => {
    return (
      location.pathname === subItem.path ||
      (subItem.path !== "/" && location.pathname.startsWith(subItem.path))
    );
  };

  const drawer = (
    <div>
      {/* <Toolbar /> */}
      <List sx={{ mt: 3 }}>
        {list.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem
              disablePadding
              style={{
                color: menuItemMatch(item)
                  ? theme?.palette?.text?.default
                  : `${theme?.palette?.text?.light}`,
                borderRight: menuItemMatch(item) ? `3px solid blue` : "none",
                marginBottom: "15px",
              }}
            >
              <ListItemButton
                component={Link}
                // to={item.path}
                to={item.subItems ? undefined : item.path}
                onClick={
                  item.subItems
                    ? () => handleSubItemsToggle(item.name)
                    : undefined
                }
                sx={{ paddingY: "0" }}
              >
                <ListItemIcon
                  sx={{
                    color: menuItemMatch(item)
                      ? `${theme?.palette?.text?.secondary}`
                      : `${theme?.palette?.text?.light}`,
                    minWidth: "35px",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.name} />
                {item.subItems &&
                  (openSubItems[item.name] ||
                  location.pathname.includes("setting") == true ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  ))}
              </ListItemButton>
            </ListItem>
            {item.subItems && (
              <Collapse
                in={
                  openSubItems[item.name] ||
                  location.pathname.includes("setting") == true
                }
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItem
                      key={subIndex}
                      disablePadding
                      style={{
                        color: menuSubItemMatch(subItem)
                          ? theme?.palette?.text?.default
                          : `${theme?.palette?.text?.light}`,
                        borderRight: menuSubItemMatch(subItem)
                          ? `3px solid blue`
                          : "none",
                        marginBottom: "10px",
                        // paddingLeft: theme.spacing(4),
                      }}
                    >
                      {/* <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '35px' }}>{subItem.icon}</ListItemIcon> */}
                      <ListItemButton
                        component={Link}
                        to={subItem.path}
                        sx={{
                          paddingY: "0",
                          "&.MuiListItemButton-root": {
                            p: 0,
                            pl: "25%",
                          },
                        }}
                      >
                        <ListItemText
                          primary={subItem.name}
                          sx={{ "& > span": { fontSize: "14px" } }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <Box>
      {isSmallScreen ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
              borderRight: "unset",
            },
          }}
        >
          <Box
            display={"flex"}
            justifyContent={"center"}
            py={4}
            mt={1}
            borderBottom={`2px solid ${theme.palette.primary.lightBG}`}
          >
            <Typography sx={LogoShip}>
              STUB{" "}
              <Typography sx={LogoNest} component={"span"}>
                COLLECTOR
              </Typography>
            </Typography>
          </Box>
          {drawer}
        </Drawer>
      ) : (
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ ml: "1px", display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
          >
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                  borderRight: "unset",
                },
              }}
              open
            >
              <Box
                display={"flex"}
                justifyContent={"center"}
                mt={1}
                py={6}
                borderBottom={`2px solid ${theme.palette.primary.lightBG}`}
              >
                <Typography sx={LogoShip}>
                  STUB{" "}
                  <Typography sx={LogoNest} component={"span"}>
                    COLLECTOR
                  </Typography>
                </Typography>
              </Box>
              {drawer}
            </Drawer>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default SideDrawer;

const LogoShip = {
  fontFamily: "Poppins",
  fontWeight: "700",
  fontSize: "26px",
};

const LogoNest = {
  fontFamily: "Poppins",
  fontWeight: "400",
  fontSize: "26px",
};
