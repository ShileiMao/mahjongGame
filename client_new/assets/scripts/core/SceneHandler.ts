import { Component } from "cc";

export interface SceneHandler extends Component {
  showLayer(event: string);
  hideLayer(event: string);
}