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

    let isIFrameActive = false;

    // eslint-disable-next-line no-unused-vars
    for (const [ id, p ] of getFakeParticipants(stateful)) {
        if (p.name === IFRAME_PLAYER_PARTICIPANT_NAME) {
            isIFrameActive = true;
            break;
        }
    }

    return isIFrameActive;
}

/**
 * Retrieves the current genericIFrame URL and replaces the placeholder with data.
 *
 * @param {Function|Object} stateful - The redux store or {@code getState} function.
 * @returns {?string} - Current genericIFrame URL or undefined.
 */
export function getGenericiFrameUrl(stateful: Function | Object) {
    const state = toState(stateful);

    const { sharedIFrameTemplateUrl } = state['features/base/config'];
    let iFrameUrl = sharedIFrameTemplateUrl;

    const { room } = state['features/base/conference'];
    const lang = i18next.language || DEFAULT_LANGUAGE;

    iFrameUrl = iFrameUrl.replace('{room}', room);
    iFrameUrl = iFrameUrl.replace('{lang}', lang);

    return `${iFrameUrl}`;
}
