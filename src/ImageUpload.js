import { Button, Input, LinearProgress } from "@material-ui/core";
import PublishIcon from "@material-ui/icons/Publish";
import React, { useState } from "react";
import { db, storage } from "./firebase";
import firebase from "firebase";
import "./ImageUpload.css";
import { useStateValue } from "./StateProvider";
import { v4 as uuidv4 } from "uuid";

function ImageUpload() {
  const [{ user }, dispatch] = useStateValue();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);

  const handleChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleUpload = (event) => {
    event.preventDefault();
    const name = uuidv4();
    const uploadTask = storage.ref("images/" + name).put(image);

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
          .ref("images")
          .child(name)
          .getDownloadURL()
          .then((url) => {
            db.collection("posts").add({
              timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
              username: user.displayName,
              email: user.email,
              caption: caption,
              imageUrl: url,
            });
          });
        setProgress(0);
        setCaption("");
        setImage(null);
      }
    );
  };

  return (
    <center>
      <form className="image_upload_form" onSubmit={handleUpload}>
        <h3 className="image_upload_form_header">
          Upload New Posts here... <PublishIcon className="upload_icon" />
        </h3>
        <LinearProgress variant="determinate" value={progress} max="100" />
        <Input
          type="text"
          onChange={(event) => setCaption(event.target.value)}
          placeholder="caption"
          value={caption}
        />
        <Input type="file" onChange={handleChange} />
        <Button className="image_upload_button" type="submit">
          UPLOAD
        </Button>
      </form>
    </center>
  );
}

export default ImageUpload;
