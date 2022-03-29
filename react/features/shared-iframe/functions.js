import { getFakeParticipants } from '../base/participants';
import { toState } from '../base/redux';

import { IFRAME_PLAYER_PARTICIPANT_NAME } from './constants';


/**
 * Returns true if an IFrame is shared in the meeting.
 *
 * @param {Object | Function} stateful - The Redux state or a function that gets resolved to the Redux state.
 * @returns {boolean}
 */
export function isIFrameSharingActive(stateful: Object | Function): boolean {

    let isIFrameActive = false;
    const state = toState(stateful);
    const { sharedIFrameName } = state['features/base/config'];

    // eslint-disable-next-line no-unused-vars
    for (const [ id, p ] of getFakeParticipants(stateful)) {
        if (p.name === sharedIFrameName || p.name === IFRAME_PLAYER_PARTICIPANT_NAME) {
            isIFrameActive = true;
            break;
        }
    }

    return isIFrameActive;
}

/**
 * Fills the templateURL by replacing the placeholders with data.
 *
 * @param {string} templateUrl - The templateUrl to be templated.
 * @param {string} room - The room value for the template.
 * @param {string} lang - The language value for the template.
 * @returns {string} - The iFrameURL or empty string.
 */
export function getGenericiFrameUrl(templateUrl, room, lang) {
    let iFrameUrl = templateUrl || '';

    iFrameUrl = iFrameUrl.replace('{room}', room);
    iFrameUrl = iFrameUrl.replace('{lang}', lang);

    return `${iFrameUrl}`;
}
