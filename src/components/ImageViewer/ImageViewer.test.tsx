import React from 'react';
import {render} from '@testing-library/react';
import {ImageViewer, Encoding, TransportLayer} from "./ImageViewer";


test("component test", () => {
    render(<ImageViewer topic="/camera/streaming" containerHeight={480} containerWidth={640} encoding={Encoding.ros} transportLayer={TransportLayer.compressed}/>)

    const testImage = document.querySelector("img") as HTMLImageElement;
    expect(testImage.src).toContain("http://localhost:8080/stream?topic=/camera/streaming&type=ros_compressed&default_transport=compressed&width=640&height=480");
    expect(testImage.alt).toContain("");
    expect(testImage.height).toEqual(480);
    expect(testImage.width).toEqual(640);
})