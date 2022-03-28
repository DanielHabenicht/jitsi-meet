// @flow

import { ReducerRegistry } from '../base/redux';

import { RESET_SHARED_IFRAME_STATUS, SET_SHARED_IFRAME_STATUS } from './actionTypes';

/**
 * Reduces the Redux actions of the feature features/shared-iframe.
 */
ReducerRegistry.register('features/shared-iframe', (state = {}, action) => {
    const { iFrameTemplateUrl, isSharing, ownerId } = action;

    switch (action.type) {
    case RESET_SHARED_IFRAME_STATUS:
        return {};
    case SET_SHARED_IFRAME_STATUS:
        return {
            ...state,
            ownerId,
            isSharing,
            iFrameTemplateUrl
        };
    default:
        return state;
    }
});
