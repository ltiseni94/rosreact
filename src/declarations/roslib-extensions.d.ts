import 'roslib';

import { VoidFunc } from './types';

/**
 * Module extension for roslib to allow attaching a uid to each instance.
 * Helps track which topics are for which ROS
 * Also augmenting the Topic interface to know what its created hash is
 */
declare module 'roslib' {
    interface Ros {
        // UUID to identify an instance
        uid?: string;
        // Callbacks specifically added by RosConnection, to easily remove later
        connectorCallbacks: Map<string, Set<VoidFunc>>;
    }

    interface Topic {
        // EXISTING FIELD -- exposing through augmentation
        isAdvertised: boolean;
        // Hash of settings for easy lookup
        settingsHash?: string;
    }
}
