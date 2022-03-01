// @flow

import { SET_DISABLE_SHARED_IFRAME_BUTTON } from './actionTypes';

export * from './actions.any';

/**
 * Disabled share iframe button.
 *
 * @param {boolean} disabled - The current state of the share iframe button.
 * @returns {{
 *     type: SET_DISABLE_SHARED_IFRAME_BUTTON,
 *     disabled: boolean
 * }}
 */
export function setDisableButton(disabled: boolean) {
    return {
        type: SET_DISABLE_SHARED_IFRAME_BUTTON,
        disabled
    };
}
