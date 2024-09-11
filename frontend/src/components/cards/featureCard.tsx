import { IFeature } from "@src/models/dtos";
import React from "react";

export default function FeatureCard(feature: IFeature) {
  return (
    <div className="flex flex-col">
      {React.createElement(feature.icon, { height: "100px", width: "100px" })}
      <p className="mt-8 mb-4 h4 font-bold ">{feature.title}</p>
      <p className="body1 !font-medium text-neutral-800">
        {feature.description}
      </p>
    </div>
  );
}
