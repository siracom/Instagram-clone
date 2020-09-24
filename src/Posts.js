import React from "react";
import InstagramEmbed from "react-instagram-embed"; //react-instagram-embed
import Post from "./Post";
import ImageUpload from "./ImageUpload";
import ProfileUpdate from "./ProfileUpdate";
import "./Posts.css";
import IconButton from "@material-ui/core/IconButton";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import { useStateValue } from "./StateProvider";
import { Icon } from "@material-ui/core";

function Posts({ posts }) {
  const [{ user }, dispatch] = useStateValue();
  return (
    <div className="posts">
      <div className="posts_left">
        <div className="mobile_view_upload">
          <ImageUpload />
          <ProfileUpdate />
        </div>

        {posts.map((post) => {
          return (
            <Post
              id={post.id}
              key={post.id}
              avatarURL={post.avatarURL}
              username={post.username}
              imageUrl={post.imageUrl}
              caption={post.caption}
            />
          );
        })}
      </div>
      <a id="go_top" className="arrow_button" href="#app">
        <IconButton color="secondary">
          <ArrowUpwardIcon color="secondary" />
        </IconButton>
      </a>
      <div className="posts_right">
        <InstagramEmbed
          url="https://www.instagram.com/p/CE41p1hlqnI/"
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
        <ImageUpload />
        <ProfileUpdate />
      </div>
    </div>
  );
}

export default Posts;
