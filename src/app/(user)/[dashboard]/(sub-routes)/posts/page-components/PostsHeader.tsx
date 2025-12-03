import Button from "@/app/components/buttons/Buttons";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import { ContentType } from "@/app/components/types and interfaces/Posts";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";

const PostsHeader = () => {
  const { extendRouteWithQuery } = useGlobalState();
  return (
    <header className="flex w-full p-8">
      <div className="flex w-full justify-between items-center">
        <BasicHeader
          heading="Posts And Articles"
          subHeading="Manage, edit and create all your posts, blogs and articles on Profolio"
          headingClass="md:text-6xl text-4xl font-bold"
          subHeadingClass="md:text-3xl text-xl font-semibold"
        />
        <div>
          <Button
            text="What's on your mind?"
            onClick={() =>
              extendRouteWithQuery({ new: "true", type: ContentType.POST })
            }
          />
        </div>
      </div>
    </header>
  );
};

export default PostsHeader;
