import React, { useEffect, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import { db } from "./firebase";
import "./Post.css";
import firebase from "firebase";
import IconButtton from "@material-ui/core/IconButton";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { useStateValue } from "./StateProvider";

function Post(props) {
  const [{ user }, dispatch] = useStateValue();
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [viewComments, setViewComments] = useState(false);
  const [like, setLike] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    let unsubscribe, unsubscribe1, unsubscribe2;
    if (props.id) {
      unsubscribe = db
        .collection("posts")
        .doc(props.id)
        .collection("comments")
        .orderBy("timeStamp", "asc")
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
        });
      unsubscribe1 = db
        .collection("posts")
        .doc(props.id)
        .collection("likes")
        .doc(user.email)
        .get()
        .then((doc) => {
          if (doc.data()) {
            setLike(true);
          } else {
            setLike(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
    unsubscribe2 = db
      .collection("posts")
      .doc(props.id)
      .collection("likes")
      .onSnapshot((snapshot) => {
        setLikeCount(snapshot.docs.length);
      });
    return () => {
      unsubscribe();
      unsubscribe1();
    };
  }, [props.id]);

  const toggleLike = () => {
    db.collection("posts")
      .doc(props.id)
      .collection("likes")
      .doc(user.email)
      .get()
      .then((doc) => {
        if (doc.data()) {
          db.collection("posts")
            .doc(props.id)
            .collection("likes")
            .doc(user.email)
            .delete();
        } else {
          db.collection("posts")
            .doc(props.id)
            .collection("likes")
            .doc(user.email)
            .set({});
        }
      });
    setLike(like ? false : true);
  };

  const postComment = (event) => {
    event.preventDefault();
    db.collection("posts").doc(props.id).collection("comments").add({
      timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
      text: comment,
    });
    setComment("");
  };

  return (
    <div className="post">
      <div className="post_header">
        <Avatar className="post_avatar" alt="" src={props.avatarURL} />
        <h3>{props.username}</h3>
      </div>
      <img className="post_image" src={props.imageUrl} alt="random" />
      <IconButtton onClick={toggleLike}>
        {!like ? (
          <FavoriteBorderIcon color="secondary" />
        ) : (
          <FavoriteIcon color="secondary" />
        )}
      </IconButtton>
      <span>{likeCount}</span>
      <h4 className="post_text">
        <strong>{props.username} </strong>
        {props.caption}
      </h4>
      {viewComments ? (
        <div className="post_comments">
          {console.log(viewComments)}
          {comments.map((comment) => (
            <p>
              <strong>{comment.username}</strong> {comment.text}
            </p>
          ))}
        </div>
      ) : comments.length ? (
        <button
          className="view_comments_button"
          onClick={() => {
            setViewComments(true);
          }}
        >
          View all {comments.length} comments
        </button>
      ) : (
        <p
          style={{
            paddingLeft: "20px",
            color: "lightgray",
            fontSize: "13.3333px",
          }}
        >
          Be the first to comment on this post
        </p>
      )}

      <form className="comment_box" onSubmit={postComment}>
        <input
          className="comment_box_input"
          onChange={(event) => setComment(event.target.value)}
          type="text"
          placeholder="Add comment here.."
          value={comment}
        />
        <button
          className={
            !comment ? "comment_box_button_disabled" : "comment_box_button"
          }
          type="submit"
          disabled={!comment}
        >
          Post
        </button>
      </form>
    </div>
  );
}

export default Post;
