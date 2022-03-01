/* @flow */
/* eslint-disable no-invalid-this */
import Logger from '@jitsi/logger';
import React from 'react';

import { sendAnalytics, createSharedVideoEvent as createEvent } from '../../../analytics';
import { getCurrentConference } from '../../../base/conference';
import { getLocalParticipant } from '../../../base/participants';
import { connect } from '../../../base/redux';
import { NOTIFICATION_TIMEOUT_TYPE } from '../../../notifications';
import { showWarningNotification } from '../../../notifications/actions';
import { dockToolbox } from '../../../toolbox/actions.web';

const logger = Logger.getLogger(__filename);

/**
 * The type of the React {@link PureComponent} props of {@link IFrameManager}.
 */
export type Props = {

    /**
     * The current coference.
     */
    _conference: Object,

    /**
     * Warning that indicates an incorect video url.
     */
    _displayWarning: Function,

    /**
     * Docks the toolbox.
     */
    _dockToolbox: Function,

    /**
     * Is the video shared by the local user.
     *
     * @private
     */
    _isOwner: boolean,

    /**
     * The shared video owner id.
     */
    _ownerId: string,

    /**
     * Updates the shared video status.
     */
    _setSharedVideoStatus: Function,

    /**
     * The video url.
     */
    _iFrameUrl: string,

    /**
     * The video id.
     */
    videoId: string
}

/**
 * Manager of shared video.
 */
class IFrameManager extends React.PureComponent<Props> {

    /**
     * Initializes a new instance of AbstractVideoManager.
     *
     * @returns {void}
     */
    constructor() {
        super();
        this.iFrameRef = React.createRef();
    }

    /**
     * Implements React Component's componentDidMount.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props._dockToolbox(true);
        this.processUpdatedProps();
    }

    /**
     * Implements React Component's componentDidUpdate.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps: Props) {
        const { _iFrameUrl } = this.props;

        if (prevProps._iFrameUrl !== _iFrameUrl) {
            sendAnalytics(createEvent('started'));
        }

        this.processUpdatedProps();
    }

    /**
     * Implements React Component's componentWillUnmount.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        sendAnalytics(createEvent('stopped'));

        if (this.dispose) {
            this.dispose();
        }

        this.props._dockToolbox(false);
    }

    /**
     * Processes new properties.
     *
     * @returns {void}
     */
    processUpdatedProps() {
        const { _isOwner } = this.props;

        if (_isOwner) {
            return;
        }
    }

    /**
     * Handle video error.
     *
     * @returns {void}
     */
    onError() {
        logger.error('Error in the generic iframe');
        this.props._displayWarning();
    }

    /**
     * Disposes current video player.
     */
    dispose: () => void;

    /**
     * Implements React Component's render.
     *
     * @inheritdoc
     */
    render() {
        const { _iFrameUrl, } = this.props;
        debugger;

        return (<iframe
            frameBorder = { 0 }
            height = '100%'
            id = 'sharedIFrame'
            ref = { this.iFrameRef }
            scrolling = 'no'
            src = { _iFrameUrl }
            width = '100%' />);
    }
}


/**
 * Maps part of the Redux store to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {Props}
 */
function _mapStateToProps(state: Object): $Shape<Props> {
    const { ownerId, iFrameUrl } = state['features/shared-iframe'];
    const localParticipant = getLocalParticipant(state);

    return {
        _conference: getCurrentConference(state),
        _isOwner: ownerId === localParticipant.id,
        _ownerId: ownerId,
        _iFrameUrl: iFrameUrl
    };
}

/**
 * Maps part of the props of this component to Redux actions.
 *
 * @param {Function} dispatch - The Redux dispatch function.
 * @returns {Props}
 */
function _mapDispatchToProps(dispatch: Function): $Shape<Props> {
    return {
        _displayWarning: () => {
            dispatch(showWarningNotification({
                titleKey: 'dialog.shareVideoLinkError'
            }, NOTIFICATION_TIMEOUT_TYPE.LONG));
        },
        _dockToolbox: value => {
            dispatch(dockToolbox(value));
        }
    };
}

export default connect(_mapStateToProps, _mapDispatchToProps)(IFrameManager);
