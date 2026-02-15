import { ContentCreate } from "@/app/components/types and interfaces/Posts";
import React from "react";

const PostForm = ({
  content,
  setBody,
  save,
}: {
  content: ContentCreate;
  setBody: (body: Record<string, string>[]) => void;
  save: (data: {
    file: File | null;
    croppedImage: string | null;
  }) => Promise<void>;
}) => {
  console.log("PostForm content:", content);
  return <div></div>;
};

export default PostForm;
