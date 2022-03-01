import { getCurrentConference } from '../base/conference';
import { getLocalParticipant } from '../base/participants';

import { RESET_SHARED_IFRAME_STATUS, SET_SHARED_IFRAME_STATUS } from './actionTypes';
import { getGenericiFrameUrl } from './functions';

/**
 * Resets the status of the shared iframe.
 *
 * @returns {{
 *     type: SET_SHARED_IFRAME_STATUS,
 * }}
 */
export function resetSharedIFrameStatus() {
    return {
        type: RESET_SHARED_IFRAME_STATUS
    };
}

/**
 * Updates the current known status of the shared iframe.
 *
 * @param {Object} options - The options.
 * @param {boolean} options.muted - Is iframe muted.
 * @param {boolean} options.ownerId - Participant ID of the owner.
 * @param {boolean} options.isSharing - Sharing status.
 * @param {boolean} options.time - Playback timestamp.
 * @param {boolean} options.iFrameUrl - URL of the shared iframe.
 *
 * @returns {{
 *     type: SET_SHARED_IFRAME_STATUS,
 *     muted: boolean,
 *     ownerId: string,
 *     isSharing: boolean,
 *     time: number,
 *     iFrameUrl: string,
 * }}
 */
export function setSharedIFrameStatus({ iFrameUrl, isSharing, time, ownerId, muted }) {
    return {
        type: SET_SHARED_IFRAME_STATUS,
        ownerId,
        isSharing,
        time,
        iFrameUrl,
        muted
    };
}

/**
 *
 * Shows the shared IFrame for all participants.
 *
 * @param {string} iFrameUrl - The iframe url to be played.
 *
 * @returns {Function}
 */
export function showSharedIFrame(iFrameUrl) {
    return (dispatch, getState) => {
        const conference = getCurrentConference(getState());

        if (conference) {
            const localParticipant = getLocalParticipant(getState());

            dispatch(setSharedIFrameStatus({
                iFrameUrl,
                isSharing: 'true',
                time: 0,
                ownerId: localParticipant.id
            }));
        }
    };
}

/**
 *
 * Stops sharing of the IFrame.
 *
 * @returns {Function}
 */
export function stopSharedIFrame() {
    return (dispatch, getState) => {
        const state = getState();
        const { ownerId } = state['features/shared-iframe'];
        const localParticipant = getLocalParticipant(state);

        if (ownerId === localParticipant.id) {
            dispatch(resetSharedIFrameStatus());
        }
    };
}

/**
 *
 * Toggles the shared iframe visibility.
 *
 * @returns {Function}
 */
export function toggleSharedIFrame() {
    return (dispatch, getState) => {
        const state = getState();
        const { isSharing } = state['features/shared-iframe'];

        if (isSharing === 'true') {
            dispatch(stopSharedIFrame());
        } else {
            dispatch(showSharedIFrame(getGenericiFrameUrl(state)));
        }
    };
}
