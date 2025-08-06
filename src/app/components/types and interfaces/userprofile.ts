export type ModalType = {
  type: "profile" | "cover" | null;
};

export type FieldUpdateState = {
  [key: string]: {
    isChanged: boolean;
    isUpdating: boolean;
    lastSaved?: Date;
    error?: string;
  };
};