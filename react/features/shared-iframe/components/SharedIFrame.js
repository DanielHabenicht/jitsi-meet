// @flow

import React, { PureComponent } from 'react';

import Filmstrip from '../../../../modules/UI/videolayout/Filmstrip';
import { i18next, DEFAULT_LANGUAGE } from '../../base/i18n';
import { getLocalParticipant } from '../../base/participants';
import { connect } from '../../base/redux';
import { getVerticalViewMaxWidth } from '../../filmstrip/functions.web';
import { getToolboxHeight } from '../../toolbox/functions.web';
import { getGenericiFrameUrl, getSharedIFramesInfo } from '../functions';

import IFrameManager from './IFrameManager';

const HEIGHT_OFFSET = 80;

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
     * The width of the filmstrip.
     */
    filmstripWidth: number,

    /**
     * The id of the local participant.
     */
     _localParticipantId: string,

    /**
     * The current shared iframe state.
     *
     * @private
     */
     _sharedIFrames: Object,

    /**
     * The current users room.
     *
     * @private
     */
    _room: string,

     /**
     * The current users language setting.
     *
     * @private
     */
     _lang: string,

    /**
     * The templateUrl of the IFrame which should be displayed.
     */
     shareUrl: string,
}

/** .
 * Implements a React {@link Component} which represents the large video (a.k.a.
 * The conference participant who is on the local stage) on Web/React.
 *
 * @augments Component
 */
class SharedIFrame extends PureComponent<Props> {
    /**
     * Computes the width and the height of the component.
     *
     * @returns {{
     *  height: number,
     *  width: number
     * }}
     */
    getDimensions() {
        const { clientHeight, clientWidth, filmstripVisible, filmstripWidth } = this.props;

        let width;
        let height;

        if (interfaceConfig.VERTICAL_FILMSTRIP) {
            if (filmstripVisible) {
                width = clientWidth - filmstripWidth;
            } else {
                width = clientWidth;
            }
            height = clientHeight - getToolboxHeight();
        } else {
            if (filmstripVisible) {
                height = clientHeight - Filmstrip.getFilmstripHeight();
            } else {
                height = clientHeight;
            }
            width = clientWidth;
        }

        return {
            width: `${width}px`,
            height: `${height - HEIGHT_OFFSET}px`
        };
    }

    /**
     * Computes the styles of the SharedIFrame Component.
     *
     * @param {string} templateUrl - The templateUrl of the IFrame.
     * @returns {{
     *  display: string,
     *  height: number,
     *  width: number
     * }}
     */
    getStyles(templateUrl) {
        const { shareUrl } = this.props;
        const visible = shareUrl === templateUrl;

        return {
            display: visible ? 'block' : 'none',
            ...this.getDimensions(),
            marginTop: `${HEIGHT_OFFSET}px`,
            position: 'relative'
        };
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {React$Element}
     */
    render() {
        const { _localParticipantId, _sharedIFrames, _room, _lang } = this.props;

        return (
            Object.keys(_sharedIFrames).map(key => (
                <div
                    id = { `sharedIFrame${key}` }
                    key = { `sharedIFrame${key}` }
                    style = { this.getStyles(_sharedIFrames[key].iFrameTemplateUrl) }>
                    <IFrameManager
                        iFrameUrl = { getGenericiFrameUrl(_sharedIFrames[key].iFrameTemplateUrl, _room, _lang) }
                        isOwner = { _sharedIFrames[key].ownerId === _localParticipantId } />
                </div>)
            )
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
    const sharedIFrames = getSharedIFramesInfo(state);
    const { clientHeight, clientWidth } = state['features/base/responsive-ui'];
    const { visible: filmstripVisible } = state['features/filmstrip'];
    const filmstripWidth = getVerticalViewMaxWidth(state);

    const localParticipant = getLocalParticipant(state);

    const { room } = state['features/base/conference'];
    const lang = i18next.language || DEFAULT_LANGUAGE;

    return {
        clientHeight,
        clientWidth,
        filmstripVisible,
        filmstripWidth,
        _localParticipantId: localParticipant?.id,
        _sharedIFrames: sharedIFrames,
        _room: room,
        _lang: lang
    };
}

export default connect(_mapStateToProps)(SharedIFrame);
