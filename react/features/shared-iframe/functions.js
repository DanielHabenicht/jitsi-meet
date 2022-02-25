// @flow
import { i18next, DEFAULT_LANGUAGE } from '../base/i18n';
import { getFakeParticipants } from '../base/participants';
import { toState } from '../base/redux';

import { IFRAME_PLAYER_PARTICIPANT_NAME } from './constants';


/**
 * Returns true if an IFrame is shared in the meeting
 *
 * @param {Object | Function} stateful - The Redux state or a function that gets resolved to the Redux state.
 * @returns {boolean}
 */
export function isIFrameSharingActive(stateful: Object | Function): boolean {

    // TODO: Rename into IsIFrameActive?
    let iFramePlaying = false;

    // eslint-disable-next-line no-unused-vars
    for (const [ id, p ] of getFakeParticipants(stateful)) {
        if (p.name === IFRAME_PLAYER_PARTICIPANT_NAME) {
            iFramePlaying = true;
            break;
        }
    }

    return iFramePlaying;
}

/**
 * Retrieves the current genericIFrame URL and replaces the placeholder with data.
 *
 * @param {Function|Object} stateful - The redux store or {@code getState} function.
 * @returns {?string} - Current genericIFrame URL or undefined.
 */
export function getGenericIFrameUrl(stateful: Function | Object) {
    const state = toState(stateful);
    let { iframeUrl } = state['features/shared-iframe'];
    const { room } = state['features/base/conference'];
    const lang = i18next.language || DEFAULT_LANGUAGE;

    if (!iframeUrl) {
        return undefined;
    }

    iframeUrl = iframeUrl.replace('{room}', room);
    iframeUrl = iframeUrl.replace('{lang}', lang);

    return `${iframeUrl}`;
}