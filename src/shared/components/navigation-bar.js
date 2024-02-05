import React, { useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";

export default function NavigationBar() {
  const classes = useStyles();
  const [login, setLogin] = useState(false);
  return (
    <AppBar position="static" className={classes.appBar} style={{width:'100rem'}}>
      <Box
        display={"flex"}
        flexDirection={"row-reverse"}
        justifyContent={"start"}
        sx={{ width: '100rem' }}
      >
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <Link to="/" className={classes.link}>
              Map
            </Link>
          </Typography>
          <Typography variant="h6" className={classes.title}>
            <Link to="/sheet" className={classes.link}>
              Data
            </Link>
          </Typography>
          <Typography variant="h6" className={classes.title}>
            <Link to="/geoserver" className={classes.link}>
              Geoserver
            </Link>
          </Typography>
        </Toolbar>
      </Box>
    </AppBar>
  );
}

const useStyles = makeStyles((theme) =>
  createStyles({
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      marginRight: "2rem",
    },
    link: {
      color: "#fff",
      textDecoration: "none",
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
   
  })
);
