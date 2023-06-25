import { Ros } from 'roslib';
import { v4 as uuidv4 } from 'uuid';

type RosProps = ConstructorParameters<typeof Ros>[0];
type RosPropsWithoutUrl = Omit<RosProps, 'url'>;
interface RosInstanceHolder {
    [url: string]: Ros;
}

const RosInstances: RosInstanceHolder = {};

/**
 * Creates a ROS instance and stores it by its URL.
 * Does not connect for you.
 *
 * @param url The URL to connect to. Should not be an empty string
 * @param options Ros constructor parameters, without the URL.
 * @return Ros instance
 */
export const getRosObject = (url: string, options: RosPropsWithoutUrl = {}): Ros => {
    let rosInstance = new Ros(options);
    rosInstance.uid = uuidv4();
    rosInstance.connectorCallbacks = new Map();
    if (RosInstances[url] === undefined) {
        // cache miss, store
        RosInstances[url] = rosInstance;
    } else {
        rosInstance = RosInstances[url];
    }

    return rosInstance;
};

export const finalizeRosConnection = (ros: Ros, url: string) => {
    ros.close();

    if (ros.uid === undefined || ros.uid === '') {
        return;
    }

    // Remove this tracking uid and the instance
    delete RosInstances[url];
};
