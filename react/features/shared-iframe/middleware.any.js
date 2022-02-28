// @flow

import { batch } from 'react-redux';

import { CONFERENCE_LEFT, getCurrentConference } from '../base/conference';
import {
    PARTICIPANT_LEFT,
    getLocalParticipant,
    participantJoined,
    participantLeft,
    pinParticipant
} from '../base/participants';
import { MiddlewareRegistry, StateListenerRegistry } from '../base/redux';

import { SET_SHARED_IFRAME_STATUS, RESET_SHARED_IFRAME_STATUS } from './actionTypes';
import {
    resetSharedIFrameStatus,
    setSharedIFrameStatus
} from './actions.any';
import { SHARED_IFRAME, IFRAME_PLAYER_PARTICIPANT_NAME } from './constants';

/**
 * Middleware that captures actions related to video sharing and updates
 * components not hooked into redux.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const { dispatch, getState } = store;
    const state = getState();
    const conference = getCurrentConference(state);
    const localParticipantId = getLocalParticipant(state)?.id;
    const { iFrameUrl, isSharing, ownerId, time, muted, volume } = action;
    const { ownerId: stateOwnerId, iFrameUrl: stateiFrameUrl } = state['features/shared-iframe'];

    switch (action.type) {
    case CONFERENCE_LEFT:
        debugger;

        dispatch(resetSharedIFrameStatus());
        break;
    case PARTICIPANT_LEFT:
        debugger;
        if (action.participant.id === stateOwnerId) {
            batch(() => {
                dispatch(resetSharedIFrameStatus());
                dispatch(participantLeft(stateiFrameUrl, conference));
            });
        }
        break;
    case SET_SHARED_IFRAME_STATUS:
        debugger;
        if (localParticipantId === ownerId) {
            sendShareIFrameCommand({
                conference,
                localParticipantId,
                muted,
                isSharing,
                time,
                id: iFrameUrl,
                volume
            });
        }
        break;
    case RESET_SHARED_IFRAME_STATUS:
        debugger;
        if (localParticipantId === stateOwnerId) {
            sendShareIFrameCommand({
                conference,
                id: stateiFrameUrl,
                localParticipantId,
                muted: true,
                isSharing: false,
                time: 0,
                volume: 0
            });
        }
        break;
    }

    return next(action);
});

/**
 * Set up state change listener to perform maintenance tasks when the conference
 * is left or failed, e.g. Clear messages or close the chat modal if it's left
 * open.
 */
StateListenerRegistry.register(
    state => getCurrentConference(state),
    (conference, store, previousConference) => {
        if (conference && conference !== previousConference) {
            conference.addCommandListener(SHARED_IFRAME,
                ({ value, attributes }) => {
                    // debugger;

                    const { dispatch, getState } = store;
                    const { from } = attributes;
                    const localParticipantId = getLocalParticipant(getState()).id;

                    if (attributes.isSharing === 'true') {
                        handleSharingVideoStatus(store, value, attributes, conference);
                    } else {
                        dispatch(participantLeft(value, conference));
                        if (localParticipantId !== from) {
                            dispatch(resetSharedIFrameStatus());
                        }
                    }
                }
            );
        }
    }
);

/**
 * Handles the playing, pause and start statuses for the shared video.
 * Dispatches participantJoined event and, if necessary, pins it.
 * Sets the SharedVideoStatus if the event was triggered by the local user.
 *
 * @param {Store} store - The redux store.
 * @param {string} iFrameUrl - The id of the video to the shared.
 * @param {Object} attributes - The attributes received from the share video command.
 * @param {JitsiConference} conference - The current conference.
 * @returns {void}
 */
function handleSharingVideoStatus(store, iFrameUrl, { isSharing, time, from, muted }, conference) {
    const { dispatch, getState } = store;
    const localParticipantId = getLocalParticipant(getState()).id;
    const oldStatus = getState()['features/shared-iframe']?.isSharing;

    debugger;
    if (isSharing === 'true') {
        // TODO: Add avatar url
        const avatarURL = '';

        dispatch(participantJoined({
            conference,
            id: iFrameUrl,
            isFakeParticipant: true,
            avatarURL,
            name: IFRAME_PLAYER_PARTICIPANT_NAME
        }));

        dispatch(pinParticipant(iFrameUrl));
    }

    if (localParticipantId !== from) {
        dispatch(setSharedIFrameStatus({
            muted: muted === 'true',
            ownerId: from,
            status: state,
            time: Number(time),
            iFrameUrl
        }));
    }
}

/* eslint-disable max-params */

/**
 * Sends SHARED_VIDEO command.
 *
 * @param {string} id - The id of the video.
 * @param {string} status - The status of the shared video.
 * @param {JitsiConference} conference - The current conference.
 * @param {string} localParticipantId - The id of the local participant.
 * @param {string} time - The seek position of the video.
 * @returns {void}
 */
function sendShareIFrameCommand({ id, isSharing, conference, localParticipantId, time, muted, volume }) {
    conference.sendCommandOnce(SHARED_IFRAME, {
        value: id,
        attributes: {
            from: localParticipantId,
            muted,
            isSharing,
            time,
            volume
        }
    });
}
