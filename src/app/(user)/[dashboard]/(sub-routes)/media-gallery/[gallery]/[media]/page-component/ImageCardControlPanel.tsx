import { PopOverPosition } from "@/app/components/containers/divs/PopOver";
import CheckBox from "@/app/components/inputs/CheckBox";
import RangeInput from "@/app/components/inputs/RangeInput";
import { Textinput } from "@/app/components/inputs/Textinput";
import {
  ContentPosition,
  ImageCardProps,
  SpacingVariant,
  TextSizeVariant,
  TextWeightVariant,
  BorderStyleVariant,
  BorderColorVariant,
  BorderRadiusVariant,
  ColorVariant,
  ShadowVariant,
  HoverShadowVariant,
  TransitionVariant,
  HoverEffectVariant,
  AnimationVariant,
} from "@/app/components/types and interfaces/ImageCardTypes";
import {
  contentPositionOptions,
  spacingVariantsOptions,
  textSizeVariantsOptions,
  textWeightVariantsOptions,
  borderStyleVariantsOptions,
  borderColorVariantsOptions,
  borderRadiusVariantsOptions,
  colorVariantsOptions,
  shadowVariantsOptions,
  hoverShadowVariantsOptions,
  transitionVariantsOptions,
  hoverEffectVariantsOptions,
  animationVariantsOptions,
  popOverPositionsOption,
  popOverDisplayModeOption,
} from "@/app/components/utilities/indices/DropDownItems";
import React, { useState } from "react";
import { DisplayMode } from "../../../page-components/GalleryCardActions";
import ColorPicker from "@/app/components/inputs/ColorPicker";
import Button from "@/app/components/buttons/Buttons";

const ImageCardControlPanel = ({
  mediaData,
  setMediaData,
  onClick,
  loading,
}: {
  loading: boolean;
  mediaData: ImageCardProps;
  setMediaData: React.Dispatch<React.SetStateAction<ImageCardProps>>;
  onClick: () => void;
}) => {
  const [CustomColor, setCustomColor] = useState(true);
  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-xs text-[var(--accent)] animate-pulse ">
       {` Click on the icon "-" above to minimize this tab and review changes`}
      </p>
      {/* Content Display & Layout Section */}
      <h2 className="font-semibold">Content Display & Layout</h2>
      <span className="flex items-center gap-x-2">
        <CheckBox
          isChecked={Boolean(mediaData?.showContent)}
          setIsChecked={(e: boolean) => {
            setMediaData((prev: ImageCardProps) => ({
              ...prev,
              showContent: e,
            }));
          }}
          label="Show Content"
        />
      </span>

      {Boolean(mediaData?.showContent) && (
        <div className="flex flex-col gap-2">
          <span>
            <Textinput
              value={mediaData.contentPosition}
              type="dropdown"
              options={contentPositionOptions}
              label="Content Position"
              placeholder="Select Content Position"
              onChange={(value: string) => {
                setMediaData((prev: ImageCardProps) => ({
                  ...prev,
                  contentPosition: value as ContentPosition,
                }));
              }}
            />
          </span>
          <span>
            <Textinput
              value={mediaData.contentPadding}
              type="dropdown"
              options={spacingVariantsOptions}
              label="Content Spacing"
              placeholder="Select Content Spacing"
              onChange={(value: string) => {
                setMediaData((prev: ImageCardProps) => ({
                  ...prev,
                  contentPadding: value as SpacingVariant,
                }));
              }}
            />
          </span>
          <span>
            <CheckBox
              isChecked={Boolean(mediaData.fullText)}
              setIsChecked={(e: boolean) => {
                setMediaData((prev: ImageCardProps) => ({
                  ...prev,
                  fullText: e,
                }));
              }}
              label="Show full text"
            />
          </span>

          {!mediaData.fullText && (
            <div className="flex flex-col gap-2">
              <span>
                <RangeInput
                  value={mediaData.titleLines}
                  onChange={(value: number) => {
                    setMediaData((prev: ImageCardProps) => ({
                      ...prev,
                      titleLines: value as number,
                    }));
                  }}
                  max={5}
                  label="Title Lines"
                  id="Title Lines"
                />
              </span>
              <span>
                <RangeInput
                  value={mediaData.descriptionLines}
                  onChange={(value: number) => {
                    setMediaData((prev: ImageCardProps) => ({
                      ...prev,
                      descriptionLines: value as number,
                    }));
                  }}
                  max={10}
                  label="Description Lines"
                />
              </span>
            </div>
          )}

          {/* Typography Section */}
          <h2 className="font-semibold my-4">Typography</h2>
          <div className="flex flex-col gap-2">
            <span>
              <Textinput
                value={mediaData.titleSize}
                type="dropdown"
                options={textSizeVariantsOptions}
                label="Title Font Size"
                placeholder="Select Title Font Size"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    titleSize: value as TextSizeVariant,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.titleWeight}
                type="dropdown"
                options={textWeightVariantsOptions}
                label="Title Font Weight"
                placeholder="Select Title Font Weight"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    titleWeight: value as TextWeightVariant,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.descriptionSize}
                type="dropdown"
                options={textSizeVariantsOptions}
                label="Description Font Size"
                placeholder="Select Description Font Size"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    descriptionSize: value as TextSizeVariant,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.descriptionWeight}
                type="dropdown"
                options={textWeightVariantsOptions}
                label="Description Font Weight"
                placeholder="Select Description Font Weight"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    descriptionWeight: value as TextWeightVariant,
                  }));
                }}
              />
            </span>
          </div>

          {/* Styling & Appearance Section */}
          <h2 className="font-semibold my-4">Styling & Appearance</h2>
          <div className="flex flex-col gap-2">
            <span>
              <Textinput
                value={mediaData.borderStyle}
                type="dropdown"
                options={borderStyleVariantsOptions}
                label="Border Style"
                placeholder="Select Border Style"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    borderStyle: value as BorderStyleVariant,
                  }));
                }}
              />
            </span>
            <span>
              <RangeInput
                value={mediaData.borderWidth}
                onChange={(value: number) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    borderWidth: value,
                  }));
                }}
                max={100}
                label="Border Width"
              />
            </span>
            <span>
              {CustomColor ? (
                <span className="flex w-full justify-between items-center">
                  <ColorPicker
                    value={mediaData.borderColor}
                    onChangeComplete={(value: string) => {
                      setMediaData((prev: ImageCardProps) => ({
                        ...prev,
                        borderColor: value,
                      }));
                    }}
                    size="sm"
                    showAlpha={false}
                    showPresets={false}
                  />
                </span>
              ) : (
                <Textinput
                  value={mediaData.borderColor}
                  type="dropdown"
                  options={borderColorVariantsOptions}
                  label="Border Color"
                  placeholder="Select Border Color"
                  onChange={(value: string) => {
                    setMediaData((prev: ImageCardProps) => ({
                      ...prev,
                      borderColor: value as BorderColorVariant,
                    }));
                  }}
                />
              )}
            </span>
            <span>
              <CheckBox
                id="custom-color"
                isChecked={CustomColor}
                setIsChecked={setCustomColor}
                label="Select Custom Color"
              />
            </span>
            <span>
              <Textinput
                value={mediaData.borderRadius}
                type="dropdown"
                options={borderRadiusVariantsOptions}
                label="Border Radius"
                placeholder="Select Border Radius"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    borderRadius: value as BorderRadiusVariant,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.backgroundVariant}
                type="dropdown"
                options={colorVariantsOptions}
                label="Background Color"
                placeholder="Select Background Color"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    backgroundVariant: value as ColorVariant,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.textVariant}
                type="dropdown"
                options={colorVariantsOptions}
                label="Text Color"
                placeholder="Select Text Color"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    textVariant: value as ColorVariant,
                  }));
                }}
              />
            </span>
            <span>
              <RangeInput
                value={mediaData.overlayOpacity}
                onChange={(value: number) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    overlayOpacity: value,
                  }));
                }}
                max={100}
                label="Overlay Opacity"
              />
            </span>
            <span>
              <CheckBox
                isChecked={Boolean(mediaData.showGradientOverlay)}
                setIsChecked={(e: boolean) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    showGradientOverlay: e,
                  }));
                }}
                label="Show Gradient Overlay"
              />
            </span>
          </div>

          {/* Effects & Animation Section */}
          <h2 className="font-semibold my-4">Effects & Animation</h2>
          <div className="flex flex-col gap-2">
            <span>
              <Textinput
                value={mediaData.shadow}
                type="dropdown"
                options={shadowVariantsOptions}
                label="Shadow"
                placeholder="Select Shadow"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    shadow: value as ShadowVariant,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.hoverShadow}
                type="dropdown"
                options={hoverShadowVariantsOptions}
                label="Hover Shadow"
                placeholder="Select Hover Shadow"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    hoverShadow: value as HoverShadowVariant,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.transition}
                type="dropdown"
                options={transitionVariantsOptions}
                label="Transition"
                placeholder="Select Transition"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    transition: value as TransitionVariant,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.hoverEffect}
                type="dropdown"
                options={hoverEffectVariantsOptions}
                label="Hover Effect"
                placeholder="Select Hover Effect"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    hoverEffect: value as HoverEffectVariant,
                  }));
                }}
              />
            </span>
            <span>
              <RangeInput
                value={mediaData.hoverScale}
                onChange={(value: number) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    hoverScale: value,
                  }));
                }}
                max={10}
                min={0}
                step={0.1}
                label="Hover Scale"
              />
            </span>
            <span>
              <Textinput
                value={mediaData.animation}
                type="dropdown"
                options={animationVariantsOptions}
                label="Animation"
                placeholder="Select Animation"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    animation: value as AnimationVariant,
                  }));
                }}
              />
            </span>
          </div>

          {/* Interaction & Behavior Section */}
          <h2 className="font-semibold my-4">Interaction & Behavior</h2>
          <div className="flex flex-col gap-2">
            <span>
              <Textinput
                value={mediaData.actionPosition}
                type="dropdown"
                options={popOverPositionsOption}
                label="Actions Position"
                placeholder="Select Position"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    actionPosition: value as PopOverPosition,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.PopoverdisplayPosition}
                type="dropdown"
                options={popOverPositionsOption}
                label="Actions Popover Position"
                placeholder="Select Position"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    PopoverdisplayPosition: value as PopOverPosition,
                  }));
                }}
              />
            </span>
            <span>
              <Textinput
                value={mediaData.PopoverdisplayMode}
                type="dropdown"
                options={popOverDisplayModeOption}
                label="Actions Display Type"
                placeholder="Select Display Type"
                onChange={(value: string) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    PopoverdisplayMode: value as DisplayMode,
                  }));
                }}
              />
            </span>
            <span>
              <CheckBox
                isChecked={Boolean(mediaData.disableHover)}
                setIsChecked={(e: boolean) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    disableHover: e,
                  }));
                }}
                label="Disable Hover Effects"
              />
            </span>
            <span>
              <CheckBox
                isChecked={Boolean(mediaData.disabled)}
                setIsChecked={(e: boolean) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    disabled: e,
                  }));
                }}
                label="Disabled State"
              />
            </span>
            <span>
              <CheckBox
                isChecked={Boolean(mediaData.hideAction)}
                setIsChecked={(e: boolean) => {
                  setMediaData((prev: ImageCardProps) => ({
                    ...prev,
                    hideAction: e,
                  }));
                }}
                label="Hide Action Button"
              />
            </span>
          </div>
        </div>
      )}
      <span className="flex items-center flex-col w-full justify-end">
        <Button
          onClick={onClick}
          loading={loading}
          disabled={loading}
          text="Save"
          size="sm"
          className="w-full"
        />
      </span>
    </div>
  );
};

export default ImageCardControlPanel;
