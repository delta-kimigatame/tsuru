import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { useCookieStore } from "../../store/cookieStore";
import { PianorollBackground } from "./PianorollBackground";

export default {
  title: "EditView/Pianoroll/PianorollBackground",
  component: PianorollBackground,
} as Meta<typeof PianorollBackground>;

const Template: StoryFn<typeof PianorollBackground> = () => (
  <div style={{ position: "relative", width: "100%", margin: 0, padding: 0 }}>
    <PianorollBackground />
  </div>
);

export const LightMode = Template.bind({});
LightMode.play = async () => {
  const store = useCookieStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
};

export const DarkMode = Template.bind({});
DarkMode.play = async () => {
  const store = useCookieStore.getState();
  store.setMode("dark");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
};

export const Zoom05 = Template.bind({});
Zoom05.play = async () => {
  const store = useCookieStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(0.5);
};
