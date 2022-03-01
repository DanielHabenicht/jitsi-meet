// @flow

import { ReducerRegistry } from '../base/redux';

import { RESET_SHARED_IFRAME_STATUS, SET_SHARED_IFRAME_STATUS } from './actionTypes';

const initialState = {};

/**
 * Reduces the Redux actions of the feature features/shared-iframe.
 */
ReducerRegistry.register('features/shared-iframe', (state = initialState, action) => {
    const { iFrameUrl, isSharing, time, ownerId, muted, volume } = action;

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
            iFrameUrl,
            volume
        };
    default:
        return state;
    }
});
