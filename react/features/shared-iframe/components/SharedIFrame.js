// @flow

import React, { Component } from 'react';

import Filmstrip from '../../../../modules/UI/videolayout/Filmstrip';
import { i18next, DEFAULT_LANGUAGE } from '../../base/i18n';
import { getLocalParticipant } from '../../base/participants';
import { connect } from '../../base/redux';
import { getToolboxHeight } from '../../toolbox/functions.web';
import { getGenericiFrameUrl } from '../functions';

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
     * Is the iframe shared by the local user.
     */
    isOwner: boolean,

    /**
     * The shared iframe template url.
     *
     * @private
     */
    _iFrameTemplateUrl: string,

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
     * Decides if the shared iframe should be visible.
     */
     visible: string,
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
     * Computes the styles of the SharedIFrame Component.
     *
     * @returns {{
     *  display: string,
     *  height: number,
     *  width: number
     * }}
     */
    getStyles() {
        const { visible } = this.props;

        return {
            display: visible ? 'block' : 'none',
            ...this.getDimensions()
        };
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {React$Element}
     */
    render() {
        const { isOwner, _iFrameTemplateUrl, _room, _lang } = this.props;

        return (
            <div
                id = 'sharedIFrame'
                style = { this.getStyles() }>
                <IFrameManager
                    iFrameUrl = { getGenericiFrameUrl(_iFrameTemplateUrl, _room, _lang) }
                    isOwner = { isOwner } />
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
    const { ownerId, iFrameTemplateUrl } = state['features/shared-iframe'];
    const { clientHeight, clientWidth } = state['features/base/responsive-ui'];
    const { visible } = state['features/filmstrip'];

    const localParticipant = getLocalParticipant(state);

    const { room } = state['features/base/conference'];
    const lang = i18next.language || DEFAULT_LANGUAGE;

    return {
        clientHeight,
        clientWidth,
        filmstripVisible: visible,
        isOwner: ownerId === localParticipant?.id,
        _iFrameTemplateUrl: iFrameTemplateUrl,
        _room: room,
        _lang: lang
    };
}

export default connect(_mapStateToProps)(SharedIFrame);
