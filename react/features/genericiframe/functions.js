// @flow

import { toState } from "../base/redux";

const ETHERPAD_OPTIONS = {
    showControls: "true",
    showChat: "false",
    showLineNumbers: "true",
    useMonospaceFont: "false",
};

/**
 * Retrieves the current genericIFrame URL.
 *
 * @param {Function|Object} stateful - The redux store or {@code getState} function.
 * @returns {?string} - Current genericIFrame URL or undefined.
 */
export function getGenericIFrameUrl(stateful: Function | Object) {
    const state = toState(stateful);
    const { iframeUrl } = state["features/genericiframe"];

    if (!iframeUrl) {
        return undefined;
    }

    // Add templating engine to add options
    const { displayName } = state["features/base/settings"];
    const params = new URLSearchParams(ETHERPAD_OPTIONS);

    return `${iframeUrl}`;
}
