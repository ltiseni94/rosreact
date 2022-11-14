import React from "react";
import PropTypes from "prop-types";

export enum Encoding {
    mjpeg = "mjpeg",
    ros = "ros_compressed",
    png = "png",
    vp8 = "vp8",
    h264 = "h264",
}

export enum TransportLayer {
    raw = "raw",
    compressed = "compressed",
    theora = "theora",
}

interface ImageViewerProps {
    topic: string;
    height?: number;
    width?: number;
    containerHeight?: number;
    containerWidth?: number;
    host?: string;
    port?: number;
    encoding?: Encoding;
    transportLayer?: TransportLayer;
    quality?: number;
    disabled?: boolean;
    bitrate?: number;
    qmin?: number;
    qmax?: number;
    gop?: number;
    vp8Quality?: string;
    imageStyle?: object;
}

export function rosImageSrcString(topic: string, height: number = 480, width: number = 640, host: string = "http://localhost", port: number = 8080, encoding : Encoding = Encoding.mjpeg, transportLayer: TransportLayer = TransportLayer.raw, quality : number = 95, bitrate : number = 100000, qmin: number = 10, qmax: number = 42, gop: number = 250, vp8Quality: string = 'realtime') : string {
    if (encoding === Encoding.mjpeg) {
        return getMjpegSourceString(topic, height, width, host, port, encoding, transportLayer, quality);
    } else if (encoding === Encoding.vp8) {
        return getVp8SourceString(topic, height, width, host, port, encoding, transportLayer, bitrate, qmin, qmax, gop, vp8Quality);
    } else {
        return getOtherSourceString(topic, height, width, host, port, encoding, transportLayer);
    }
}

function getMjpegSourceString(topic: string, height: number = 480, width: number = 640, host: string = "http://localhost", port: number = 8080, encoding : Encoding = Encoding.mjpeg, transportLayer: TransportLayer = TransportLayer.raw, quality : number = 95) : string {
    return `${host}:${port}/stream?topic=${topic}&type=${encoding}&default_transport=${transportLayer}&width=${width}&height=${height}&quality=${quality}`;
}

function getVp8SourceString(topic: string, height: number, width: number, host: string, port: number, encoding : Encoding, transportLayer: TransportLayer, bitrate : number, qmin: number, qmax: number, gop: number, vp8Quality: string) : string {
    return `${host}:${port}/stream?topic=${topic}&type=${encoding}&default_transport=${transportLayer}&width=${width}&height=${height}&bitrate=${bitrate}&qmin=${qmin}&qmax=${qmax}&gop=${gop}&quality=${vp8Quality}`;
}

function getOtherSourceString(topic: string, height: number, width: number, host: string, port: number, encoding: Encoding, transportLayer: TransportLayer) : string {
    return `${host}:${port}/stream?topic=${topic}&type=${encoding}&default_transport=${transportLayer}&width=${width}&height=${height}`;
}

const defaultImageStyle = {
    maxWidth: "100%",
    height: "auto",
}

export const ImageViewer = (props : ImageViewerProps) => {
    const style = props.imageStyle || ((props.containerWidth && props.containerHeight) ? {} : defaultImageStyle);
    if (props.disabled) {
        return (<img src="" alt="" style={style}/>);
    } else {
        const src = rosImageSrcString(props.topic, props.height, props.width, props.host, props.port, props.encoding, props.transportLayer, props.quality, props.bitrate, props.qmin, props.qmax, props.gop, props.vp8Quality);
        return (<img src={src} width={props.containerWidth} height={props.containerHeight} alt="" style={style}/>)
    }
}

ImageViewer.propTypes = {
    topic: PropTypes.string.isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
    containerWidth: PropTypes.number,
    containerHeight: PropTypes.number,
    host: PropTypes.string,
    port: PropTypes.number,
    encoding: PropTypes.string,
    transportLayer: PropTypes.string,
    quality: PropTypes.number,
    disabled: PropTypes.bool,
    bitrate: PropTypes.number,
    qmin: PropTypes.number,
    qmax: PropTypes.number,
    gop: PropTypes.number,
    vp8Quality: PropTypes.string,
    imageStyle: PropTypes.object,
}
