import Button from "@/app/components/buttons/Buttons";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import Popover from "@/app/components/containers/divs/PopOver";
import { ContentType } from "@/app/components/types and interfaces/Posts";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";

const ContentsHeader = () => {
  const { extendRouteWithQuery } = useGlobalState();

  const supportedContents = [
    { type: ContentType.POST, label: "Post" },
    { type: ContentType.ARTICLE, label: "Article" },
  ];

  const NewPostPopOver = () => {
    return (
      <div>
        {supportedContents.map((content, index) => (
          <Button
            key={index}
            text={`New ${content.label}`}
            onClick={() =>
              extendRouteWithQuery({ new: "true", type: content.type })
            }
            variant="ghost"
            className="w-full"
          />
        ))}
      </div>
    );
  };
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
          <Popover
          clickerClassName="w-auto"
          clicker={<Button text="What's on your mind?" />}>
            <NewPostPopOver />
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default ContentsHeader;
