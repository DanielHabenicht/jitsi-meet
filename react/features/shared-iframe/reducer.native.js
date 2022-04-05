// @flow

import { ReducerRegistry } from '../base/redux';

import { RESET_SHARED_IFRAME_STATUS, SET_SHARED_IFRAME_STATUS } from './actionTypes';

/**
 * Reduces the Redux actions of the feature features/shared-iframe.
 */
ReducerRegistry.register('features/shared-iframe', (state = {}, action) => {
    const { iFrameTemplateUrl, isSharing, ownerId, shareKey } = action;

    switch (action.type) {
    case RESET_SHARED_IFRAME_STATUS:
        return {
            ...state,
            [shareKey]: { }
        };
    case SET_SHARED_IFRAME_STATUS:
        return {
            ...state,
            [shareKey]: {
                ...state[shareKey],
                ownerId,
                isSharing,
                iFrameTemplateUrl
            }
        };
    default:
        return state;
    }
});
