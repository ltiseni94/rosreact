import PropTypes from 'prop-types';
import React from 'react';

import { DefaultMessageType } from '../../helpers/TopicHelpers';
import { PublisherMsgProp, PublisherProps, usePublisher } from './usePublisher';

export function Publisher<TMessage extends object = DefaultMessageType>(
    props: PublisherProps,
    message?: PublisherMsgProp<TMessage>,
) {
    usePublisher(props, message);

    return <React.Fragment />;
}

Publisher.propTypes = {
    topic: PropTypes.string.isRequired,
    messageType: PropTypes.string.isRequired,
    throttleRate: PropTypes.number,
    latch: PropTypes.bool,
    queueLength: PropTypes.number,
    queueSize: PropTypes.number,
    message: PropTypes.object,
    autoRepeat: PropTypes.bool,
};
