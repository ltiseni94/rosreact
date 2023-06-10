import { Context, useContext } from 'react';

export function useCheckedContext(contextType: Context<any>): any {
    const context = useContext(contextType);
    if (context === undefined) {
        throw new Error('useContext hook is being used outside its context Provider');
    }
    return context;
}

/**
 * Module extension for roslib to allow attaching a uid to each instance.
 * Helps track which topics are for which ROS
 * Also augmenting the Topic interface to know what its created hash is
 */
declare module 'roslib' {
    interface Ros {
        uid?: string;
    }

    interface Topic {
        settingsHash?: string;
    }
}
