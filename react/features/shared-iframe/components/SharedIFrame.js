// @flow

import React, { Component } from 'react';

import Filmstrip from '../../../../modules/UI/videolayout/Filmstrip';
import { getLocalParticipant } from '../../base/participants';
import { connect } from '../../base/redux';
import { getToolboxHeight } from '../../toolbox/functions.web';

import IFrameManager from './IFrameManager';


declare var interfaceConfig: Object;

type Props = {

    /**
     * The available client width.
     */
    clientHeight: number,

    /**
     * The available client width.
     */
    clientWidth: number,

    /**
     * Whether the (vertical) filmstrip is visible or not.
     */
    filmstripVisible: boolean,

    /**
     * Is the video shared by the local user.
     */
    isOwner: boolean,

    /**
     * The shared iframe url.
     */
     iFrameUrl: string,
}

/** .
 * Implements a React {@link Component} which represents the large video (a.k.a.
 * The conference participant who is on the local stage) on Web/React.
 *
 * @augments Component
 */
class SharedIFrame extends Component<Props> {
    /**
     * Computes the width and the height of the component.
     *
     * @returns {{
     *  height: number,
     *  width: number
     * }}
     */
    getDimensions() {
        const { clientHeight, clientWidth, filmstripVisible } = this.props;

        let width;
        let height;

        if (interfaceConfig.VERTICAL_FILMSTRIP) {
            if (filmstripVisible) {
                width = `${clientWidth - Filmstrip.getVerticalFilmstripWidth()}px`;
            } else {
                width = `${clientWidth}px`;
            }
            height = `${clientHeight - getToolboxHeight()}px`;
        } else {
            if (filmstripVisible) {
                height = `${clientHeight - Filmstrip.getFilmstripHeight()}px`;
            } else {
                height = `${clientHeight}px`;
            }
            width = `${clientWidth}px`;
        }

        return {
            width,
            height
        };
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {React$Element}
     */
    render() {
        const { iFrameUrl } = this.props;

        return (
            <div
                id = 'sharedIFrame'
                style = { this.getDimensions() }>
                <IFrameManager
                    iFrameUrl = { iFrameUrl } />
            </div>
        );
    }
}


/**
 * Maps (parts of) the Redux state to the associated LargeVideo props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const { ownerId, iFrameUrl } = state['features/shared-iframe'];
    const { clientHeight, clientWidth } = state['features/base/responsive-ui'];
    const { visible } = state['features/filmstrip'];

    const localParticipant = getLocalParticipant(state);

    return {
        clientHeight,
        clientWidth,
        filmstripVisible: visible,
        isOwner: ownerId === localParticipant?.id,
        iFrameUrl
    };
}

export default connect(_mapStateToProps)(SharedIFrame);
