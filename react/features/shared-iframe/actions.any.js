import { getCurrentConference } from '../base/conference';
import { getLocalParticipant } from '../base/participants';

import { RESET_SHARED_IFRAME_STATUS, SET_SHARED_IFRAME_STATUS } from './actionTypes';

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
 * @param {boolean} options.ownerId - Participant ID of the owner.
 * @param {boolean} options.isSharing - Sharing status.
 * @param {boolean} options.iFrameTemplateUrl - URL of the shared iframe.
 *
 * @returns {{
 *     type: SET_SHARED_IFRAME_STATUS,
 *     ownerId: string,
 *     isSharing: boolean,
 *     iFrameTemplateUrl: string,
 * }}
 */
export function setSharedIFrameStatus({ iFrameTemplateUrl, isSharing, ownerId }) {
    return {
        type: SET_SHARED_IFRAME_STATUS,
        ownerId,
        isSharing,
        iFrameTemplateUrl
    };
}

/**
 *
 * Shows the shared IFrame for all participants.
 *
 * @param {string} iFrameTemplateUrl - The iframe url to be played.
 *
 * @returns {Function}
 */
export function showSharedIFrame() {
    return (dispatch, getState) => {
        const state = getState();
        const conference = getCurrentConference(state);
        const { sharedIFrameTemplateUrl } = state['features/base/config'];

        if (conference) {
            const localParticipant = getLocalParticipant(state);

            dispatch(setSharedIFrameStatus({
                iFrameTemplateUrl: sharedIFrameTemplateUrl,
                isSharing: 'true',
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
            dispatch(showSharedIFrame());
        }
    };
}
