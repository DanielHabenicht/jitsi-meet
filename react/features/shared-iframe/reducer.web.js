// @flow

import { ReducerRegistry } from '../base/redux';

import { RESET_SHARED_IFRAME_STATUS, SET_SHARED_IFRAME_STATUS, SET_DISABLE_SHARED_IFRAME_BUTTON } from './actionTypes';

const initialState = {};

/**
 * Reduces the Redux actions of the feature features/shared-iframe.
 */
ReducerRegistry.register('features/shared-iframe', (state = initialState, action) => {
    const { iFrameUrl, isSharing, time, ownerId, disabled, muted } = action;

    switch (action.type) {
    case RESET_SHARED_IFRAME_STATUS:
        return initialState;
    case SET_SHARED_IFRAME_STATUS:
        return {
            ...state,
            muted,
            ownerId,
            isSharing,
            time,
            iFrameUrl
        };

    case SET_DISABLE_SHARED_IFRAME_BUTTON:
        return {
            ...state,
            disabled
        };

    default:
        return state;
    }
});
