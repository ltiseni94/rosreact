import PropTypes from 'prop-types';
import React from 'react';

import { PublisherProps, usePublisher } from './usePublisher';

export const Publisher = (props: PublisherProps) => {
    usePublisher(props);

    return <React.Fragment />;
};

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
