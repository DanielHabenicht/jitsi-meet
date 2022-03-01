// @flow

import type { Dispatch } from 'redux';

import { translate } from '../../base/i18n';
import { IconShareIFrame } from '../../base/icons';
import { connect } from '../../base/redux';
import {
    AbstractButton,
    type AbstractButtonProps
} from '../../base/toolbox/components';
import { toggleSharedIFrame } from '../actions.any';

type Props = AbstractButtonProps & {

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

    /**
     * Whether or not the button is disabled.
     */
    _isDisabled: boolean,

    /**
     * Whether or not the local participant is sharing an iframe.
     */
    _sharingIFrame: boolean
};

/**
 * Implements an {@link AbstractButton} to open the user documentation in a new window.
 */
class SharedIFrameButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.sharediframe';
    icon = IconShareIFrame;
    label = 'toolbar.sharediframe';
    toggledLabel = 'toolbar.stopSharedIFrame';

    /**
     * Dynamically retrieves tooltip based on sharing state.
     */
    get tooltip() {
        if (this._isToggled()) {
            return 'toolbar.stopSharedIFrame';
        }

        return 'toolbar.sharediframe';
    }

    /**
     * Required by linter due to AbstractButton overwritten prop being writable.
     *
     * @param {string} _value - The icon value.
     */
    set tooltip(_value) {
        // Unused.
    }

    /**
     * Handles clicking / pressing the button, and opens a new dialog.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        this._doToggleSharedIFrame();
    }

    /**
     * Indicates whether this button is in toggled state or not.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    _isToggled() {
        return this.props._sharingIFrame;
    }

    /**
     * Indicates whether this button is disabled or not.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    _isDisabled() {
        return this.props._isDisabled;
    }

    /**
     * Dispatches an action to toggle iframe sharing.
     *
     * @private
     * @returns {void}
     */
    _doToggleSharedIFrame() {
        this.props.dispatch(toggleSharedIFrame());
    }
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state): Object {
    const {
        disabled: sharedIFrameBtnDisabled,
        isSharing
    } = state['features/shared-iframe'];

    return {
        _isDisabled: sharedIFrameBtnDisabled,
        _sharingIFrame: isSharing
    };
}


export default translate(connect(_mapStateToProps)(SharedIFrameButton));
