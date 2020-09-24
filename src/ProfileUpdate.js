import React, { useState } from "react";
import "./ProfileUpdate.css";
import LinearProgress from "@material-ui/core/LinearProgress";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import { storage, db, auth } from "./firebase";
import PublishIcon from "@material-ui/icons/Publish";
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";
import { v4 as uuidv4 } from "uuid";

function ProfileUpdate() {
  const [{ user }, dispatch] = useStateValue();
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);

  const reload = () => {
    window.location.reload();
    return false;
  };

  const handleChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const uploadProfilePic = async (event) => {
    event.preventDefault();
    const name = uuidv4();
    const uploadTask = storage.ref("profilepictures/" + name).put(image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        console.log(error);
        alert(error.message);
      },
      () => {
        storage
          .ref("profilepictures")
          .child(name)
          .getDownloadURL()
          .then((url) => {
            auth.currentUser.updateProfile({
              photoURL: url,
            });

            db.collection("users").doc(user.email).set(
              {
                profilePicUrl: url,
              },
              { merge: true }
            );
            dispatch({
              type: actionTypes.SET_USER,
              user: {
                ...user,
                photoURL: url,
              },
            });
          });
        setProgress(0);
        setImage(null);
        alert("Successfully Uploaded!  Refresh to see changes!");
      }
    );
  };

  return (
    <center>
      <form className="profile_upload_form" onSubmit={uploadProfilePic}>
        <h3 className="profile_upload_form_header">
          Update Profile Pic here...
          <PublishIcon className="upload_icon" />
        </h3>
        <LinearProgress variant="determinate" value={progress} max="100" />
        <Input type="file" onChange={handleChange} />
        <Button className="image_upload_button" type="submit">
          UPLOAD
        </Button>
      </form>
    </center>
  );
}

export default ProfileUpdate;
