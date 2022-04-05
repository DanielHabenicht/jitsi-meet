// @flow

import { batch } from 'react-redux';

import { CONFERENCE_JOINED, CONFERENCE_LEFT, getCurrentConference } from '../base/conference';
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
import { SHARED_IFRAME } from './constants';

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
    const { shareKey, iFrameTemplateUrl, isSharing, ownerId } = action;

    switch (action.type) {
    case CONFERENCE_LEFT:
        // Reset all sharedIFrames
        for (const { shareKey: thisShareKey }
            of Object.keys(state['features/shared-iframe']).map(key => state['features/shared-iframe'][key])) {
            dispatch(resetSharedIFrameStatus(thisShareKey));
        }
        break;
    case CONFERENCE_JOINED:
        // TODO: Hinder pinnig of shared IFrames
        break;
    case PARTICIPANT_LEFT:
        // Check each sharedIFrame if the participant left is his owner
        for (const { shareKey: thisShareKey, iFrameTemplateUrl: thisIFrameTemplateUrl, ownerId: thisOwnerId }
            of Object.keys(state['features/shared-iframe']).map(key => state['features/shared-iframe'][key])) {
            if (action.participant.id === thisOwnerId) {
                batch(() => {
                    dispatch(resetSharedIFrameStatus(thisShareKey));
                    dispatch(participantLeft(thisIFrameTemplateUrl, conference));
                });
            }
        }
        break;
    case SET_SHARED_IFRAME_STATUS:
        if (localParticipantId === ownerId) {
            sendShareIFrameCommand(
                SHARED_IFRAME,
                {
                    shareKey,
                    conference,
                    localParticipantId,
                    isSharing,
                    id: iFrameTemplateUrl
                });
        }
        break;
    case RESET_SHARED_IFRAME_STATUS:
        if (localParticipantId === state['features/shared-iframe'][shareKey]?.ownerId) {
            sendShareIFrameCommand(
                SHARED_IFRAME,
                {
                    shareKey,
                    conference,
                    id: state['features/shared-iframe'][shareKey]?.iFrameTemplateUrl,
                    localParticipantId,
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
                    const { from, shareKey } = attributes;
                    const localParticipantId = getLocalParticipant(getState()).id;

                    if (attributes.isSharing === 'true') {
                        handleSharingIFrame(store, value, attributes, conference);
                    } else {
                        dispatch(participantLeft(value, conference));
                        if (localParticipantId !== from) {
                            dispatch(resetSharedIFrameStatus(shareKey));
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
 * @param {string} iFrameTemplateUrl - The id of the iframe to the shared.
 * @param {Object} attributes - The attributes received from the share iframe command.
 * @param {JitsiConference} conference - The current conference.
 * @returns {void}
 */
function handleSharingIFrame(store, iFrameTemplateUrl, { shareKey, isSharing, from }, conference) {
    const { dispatch, getState } = store;
    const localParticipantId = getLocalParticipant(getState()).id;

    if (isSharing === 'true') {
        const state = getState();
        const { sharedIFrameConfig } = state['features/base/config'];

        dispatch(participantJoined({
            conference,
            id: iFrameTemplateUrl,
            isFakeParticipant: true,
            avatarURL: sharedIFrameConfig[shareKey].avatarUrl,
            name: shareKey
        }));

        // TODO: only pin if already in conference
        // const { participantId } = state['features/large-video'];
        dispatch(pinParticipant(iFrameTemplateUrl));
    }

    if (localParticipantId !== from) {
        dispatch(setSharedIFrameStatus({
            ownerId: from,
            shareKey,
            isSharing,
            iFrameTemplateUrl
        }));
    }
}

/* eslint-disable max-params */

/**
 * Sends SHARED_IFRAME command.
 *
 * @param {string} commandName - The name of the IFrame.
 * @param {string} id - The id of the video.
 * @param {string} isSharing - The status of the shared iframe.
 * @param {JitsiConference} conference - The current conference.
 * @param {string} localParticipantId - The id of the local participant.
 * @returns {void}
 */
function sendShareIFrameCommand(commandName, { id, shareKey, isSharing, conference, localParticipantId }) {
    conference.sendCommandOnce(commandName, {
        value: id,
        attributes: {
            from: localParticipantId,
            shareKey,
            isSharing
        }
    });
}
