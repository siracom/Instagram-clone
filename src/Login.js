import React, { useState } from "react";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import InstagramEmbed from "react-instagram-embed";
import "./Login.css";
import { makeStyles } from "@material-ui/core/styles";
import { db } from "./firebase";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    background: "linear-gradient(62deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

function Login(props) {
  const classes = useStyles();
  const [urlList, setUrlList] = useState([]);

  window.onload = () => {
    db.collection("instagram-posts").onSnapshot((snapshot) => {
      snapshot.docs.map((doc) => {
        setUrlList((prevList) => {
          return [...prevList, doc.data().url];
        });
      });
      console.log(urlList);
    });
  };

  return (
    <div className="welcome_login gradient-background">
      <div className="welcome_login_left">
        <div
          className="welcome_login_newuser"
          onClick={props.signUp}
          title="CLICK TO SIGNUP"
        >
          <h1>
            <span>New User !</span>
          </h1>
          <h1>Welcome to the Community. Join Us and Have Fun! ✨ </h1>
        </div>
        <div
          className="welcome_login_existinguser"
          onClick={props.signIn}
          title="CLICK TO LOGIN"
        >
          <h1>
            <span>Existing User !</span>
          </h1>
          <h1>Welcome Back! We are glad to see you again 🥰 </h1>
        </div>
      </div>
      <div className="welcome_login_right">
        <div></div>
        {urlList.map((url, index) => {
          return (
            <div className="card">
              <InstagramEmbed
                key={index}
                url={url}
                maxWidth={320}
                hideCaption={false}
                containerTagName="div"
                protocol=""
                injectScript
                onLoading={() => {}}
                onSuccess={() => {}}
                onAfterRender={() => {}}
                onFailure={() => {}}
              />
            </div>
          );
        })}
      </div>
      <Backdrop className={classes.backdrop} open={!urlList.length}>
        Loading...
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default Login;
