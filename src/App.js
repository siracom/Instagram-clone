import React, { useState, useEffect } from "react"; //react
import Modal from "@material-ui/core/Modal"; //material-ui
import Avatar from "@material-ui/core/Avatar";
import InstagramEmbed from "react-instagram-embed"; //react-instagram-embed
import { Button, makeStyles, Input } from "@material-ui/core";
// import { BrowserRouter, NavLink, Link, Redirect, Prompt } from "react-router-dom";
import { db, auth } from "./firebase"; //firebase
import "./App.css"; //local
import Login from "./Login";
import Posts from "./Posts";
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  // const [user, setUser] = useState("");
  const [{ user }, dispatch] = useStateValue();

  const reload = () => {
    window.location.reload();
    return false;
  };

  async function getAvatarUrl(email) {
    let url;
    await db
      .collection("users")
      .doc(email)
      .get()
      .then((profile) => {
        url = profile.data().profilePicUrl;
      });
    return url;
  }

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log(authUser);
        // setUser(authUser);
        dispatch({
          type: actionTypes.SET_USER,
          user: authUser,
        });
        console.log(user);
      } else {
        // setUser(null);
        dispatch({
          type: actionTypes.SET_USER,
          user: null,
        });
      }
    });
  }, [user, username]);

  useEffect(() => {
    db.collection("posts")
      .orderBy("timeStamp", "desc")
      .onSnapshot(async (snapshot) => {
        setPosts(
          await Promise.all(
            snapshot.docs.map(async function getPost(doc) {
              var url = await getAvatarUrl(doc.data().email);
              console.log(url);
              return {
                id: doc.id,
                avatarURL: url,
                ...doc.data(),
              };
            })
          )
        );
      });
  }, []);

  function sendEmailVerificationLink() {
    auth.currentUser
      .sendEmailVerification()
      .then(function () {
        alert("An Email Verification Link has been Sent to " + user.email);
        console.log("Email sent");
      })
      .catch(function (error) {
        console.log(error);
        alert(error.message);
      });
  }

  function resetPassword(event) {
    event.preventDefault();
    auth
      .sendPasswordResetEmail(email)
      .then(function () {
        alert("A Password Reset Link has been sent to " + email);
      })
      .catch(function (error) {
        alert(error.message);
        console.log(error);
      });
    setOpenResetPassword(false);
  }
  function signUp(event) {
    event.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        authUser.user.updateProfile({
          displayName: username,
          photoURL: "",
        });
        db.collection("users").doc(email).set(
          {
            username: username,
            email: email,
            profilePicUrl: "",
          },
          { merge: true }
        );
      })
      .catch((error) => alert(error.message));
    setOpen(false);
    setEmail("");
    setPassword("");
  }

  function signIn(event) {
    event.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));
    setOpenSignIn(false);
    setEmail("");
    setPassword("");
  }

  return (
    <div id="app" className="app">
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app_signup_form" onSubmit={signUp}>
            <center>
              <div className="app_signup_header">
                <img
                  className="app_header_image"
                  src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                  alt="instagram-logo"
                />
              </div>
            </center>
            <Input
              type="text"
              placeholder="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            ></Input>
            <Input
              type="email"
              placeholder="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            ></Input>

            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            ></Input>
            <Button type="submit">SignUp</Button>
            <p
              onClick={() => {
                setOpen(false);
                setOpenSignIn(true);
              }}
              className="has_account"
            >
              Already have an account? Go to SignIn
            </p>
          </form>
        </div>
      </Modal>

      <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app_signup_form" onSubmit={signIn}>
            <center>
              <div className="app_signup_header">
                <img
                  className="app_header_image"
                  src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                  alt="instagram-logo"
                />
              </div>
            </center>
            <Input
              type="email"
              placeholder="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            ></Input>

            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            ></Input>
            <Button type="submit">SignIn</Button>
            <p
              onClick={() => {
                setOpenSignIn(false);
                setOpenResetPassword(true);
              }}
              className="forgot_password"
            >
              forgot password?
            </p>
          </form>
        </div>
      </Modal>

      <Modal
        open={openResetPassword}
        onClose={() => setOpenResetPassword(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app_signup_form" onSubmit={resetPassword}>
            <center>
              <div className="app_signup_header">
                <img
                  className="app_header_image"
                  src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                  alt="instagram-logo"
                />
              </div>
            </center>
            <Input
              type="email"
              placeholder="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            ></Input>

            <Button type="submit">RESET PASSWORD</Button>
          </form>
        </div>
      </Modal>

      <div className="app_header">
        <img
          className="app_header_image"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt="instagram-logo"
        />
        {user && <Avatar src={user.photoURL} />}
        {user ? (
          <Button onClick={() => auth.signOut().then(reload())}>LOGOUT</Button>
        ) : (
          <div className="app_signin_signout">
            <Button onClick={() => setOpen(true)}>SignUp</Button>
            <Button onClick={() => setOpenSignIn(true)}>SignIn</Button>
          </div>
        )}
      </div>

      {user?.emailVerified ? (
        <Posts posts={posts} />
      ) : user ? (
        <center>
          <p>
            Verify your email address. Click the{" "}
            <strong>Send Verification Link</strong> button below.
          </p>
          <Button
            style={{ margin: "10px" }}
            onClick={sendEmailVerificationLink}
            variant="contained"
            color="primary"
          >
            Send Verification Link
          </Button>
          <p>Refresh the page, after Verification.</p>
          <br />
          <br />
          <InstagramEmbed
            url="https://www.instagram.com/p/CFcCo4LHFXZ/"
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
        </center>
      ) : (
        <Login
          signIn={() => {
            setOpenSignIn(true);
          }}
          signUp={() => {
            setOpen(true);
          }}
        />
      )}
      {user?.emailVerified && (
        <div className="app_footer">
          <p>You've reached the end of the page.</p>
        </div>
      )}
    </div>
  );
}

export default App;
