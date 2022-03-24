// @flow

import { ReducerRegistry } from '../base/redux';

import { RESET_SHARED_IFRAME_STATUS, SET_SHARED_IFRAME_STATUS, SET_DISABLE_SHARED_IFRAME_BUTTON } from './actionTypes';

const initialState = {};

/**
 * Reduces the Redux actions of the feature features/shared-iframe.
 */
ReducerRegistry.register('features/shared-iframe', (state = initialState, action) => {
    const { iFrameTemplateUrl, isSharing, ownerId, disabled } = action;

    switch (action.type) {
    case RESET_SHARED_IFRAME_STATUS:
        return initialState;
    case SET_SHARED_IFRAME_STATUS:
        return {
            ...state,
            ownerId,
            isSharing,
            iFrameTemplateUrl
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
