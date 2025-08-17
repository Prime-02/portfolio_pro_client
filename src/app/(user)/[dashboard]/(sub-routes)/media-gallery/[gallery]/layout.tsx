import React, { ReactNode } from "react";

const layout = (props: { children: ReactNode; modal: ReactNode }) => {
  return (
    <div>
      {props.children}
      {props.modal}
    </div>
  );
};

export default layout;
