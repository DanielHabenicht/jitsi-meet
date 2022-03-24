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
 * Middleware that captures actions related to iframe sharing and updates
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
    const { iFrameUrl, isSharing, ownerId } = action;
    const { ownerId: stateOwnerId, iFrameUrl: stateiFrameUrl } = state['features/shared-iframe'];


    switch (action.type) {
    case CONFERENCE_LEFT:
        dispatch(resetSharedIFrameStatus());
        break;
    case PARTICIPANT_LEFT:
        if (action.participant.id === stateOwnerId) {
            batch(() => {
                dispatch(resetSharedIFrameStatus());
                dispatch(participantLeft(stateiFrameUrl, conference));
            });
        }
        break;
    case SET_SHARED_IFRAME_STATUS:
        if (localParticipantId === ownerId) {
            sendShareIFrameCommand(
                SHARED_IFRAME,
                {
                    conference,
                    localParticipantId,
                    isSharing,
                    id: iFrameUrl
                });
        }
        break;
    case RESET_SHARED_IFRAME_STATUS:
        if (localParticipantId === stateOwnerId) {
            sendShareIFrameCommand(
                SHARED_IFRAME,
                {
                    conference,
                    id: stateiFrameUrl,
                    localParticipantId,
                    muted: true,
                    isSharing: false
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
            const { dispatch, getState } = store;

            conference.addCommandListener(SHARED_IFRAME,
                ({ value, attributes }) => {
                    const { from } = attributes;
                    const localParticipantId = getLocalParticipant(getState()).id;

                    if (attributes.isSharing === 'true') {
                        handleSharingIFrame(store, value, attributes, conference);
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
 * Handles showing and hiding of the shared iframe.
 * Dispatches participantJoined event and, if necessary, pins it.
 *
 * @param {Store} store - The redux store.
 * @param {string} iFrameUrl - The id of the iframe to the shared.
 * @param {Object} attributes - The attributes received from the share iframe command.
 * @param {JitsiConference} conference - The current conference.
 * @returns {void}
 */
function handleSharingIFrame(store, iFrameUrl, { isSharing, from }, conference) {
    const { dispatch, getState } = store;
    const localParticipantId = getLocalParticipant(getState()).id;

    if (isSharing === 'true') {

        const state = getState();
        const { sharedIFrameAvatarUrl: avatarURL, sharedIFrameName } = state['features/base/config'];

        dispatch(participantJoined({
            conference,
            id: iFrameUrl,
            isFakeParticipant: true,
            avatarURL,
            name: sharedIFrameName || IFRAME_PLAYER_PARTICIPANT_NAME
        }));

        dispatch(pinParticipant(iFrameUrl));
    }

    if (localParticipantId !== from) {
        dispatch(setSharedIFrameStatus({
            ownerId: from,
            isSharing,
            iFrameUrl
        }));
    }
}

/* eslint-disable max-params */

/**
 * Sends SHARED_IFRAME command.
 *
 * @param {string} commandName - The name of the IFrame
 * @param {string} id - The id of the video.
 * @param {string} isSharing - The status of the shared iframe.
 * @param {JitsiConference} conference - The current conference.
 * @param {string} localParticipantId - The id of the local participant.
 * @returns {void}
 */
function sendShareIFrameCommand(commandName, { id, isSharing, conference, localParticipantId }) {
    conference.sendCommandOnce(commandName, {
        value: id,
        attributes: {
            from: localParticipantId,
            isSharing
        }
    });
}
