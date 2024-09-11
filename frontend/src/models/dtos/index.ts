import { StaticImageData } from "next/image";
import { SVGAttributes } from "react";

export interface IHowItWork {
  title: string;
  description: string;
  icon: StaticImageData;
}

export interface IFeature {
  title: string;
  description: string;
  icon: (props: SVGAttributes<{}>) => JSX.Element;
}
