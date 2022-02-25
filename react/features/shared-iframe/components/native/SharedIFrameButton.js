// @flow

import type { Dispatch } from 'redux';

import { getFeatureFlag, IFRAME_SHARE_BUTTON_ENABLED } from '../../../base/flags';
import { translate } from '../../../base/i18n';
import { IconShareIFrame } from '../../../base/icons';
import { getLocalParticipant } from '../../../base/participants';
import { connect } from '../../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../../base/toolbox/components';
import { toggleSharedIFrame } from '../../actions.native';

/**
 * The type of the React {@code Component} props of {@link TileViewButton}.
 */
type Props = AbstractButtonProps & {

    /**
     * Whether or not the button is disabled.
     */
    _isDisabled: boolean,

    /**
     * Whether or not the local participant is sharing a video.
     */
    _sharingIFrame: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Dispatch<any>
};

/**
 * Component that renders a toolbar button for toggling the tile layout view.
 *
 * @augments AbstractButton
 */
class SharedIFrameButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.sharediframe';
    icon = IconShareIFrame;
    label = 'toolbar.sharediframe';
    toggledLabel = 'toolbar.stopSharediframe';

    /**
     * Handles clicking / pressing the button.
     *
     * @override
     * @protected
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
        return this.props._sharingVideo;
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
     * Dispatches an action to toggle video sharing.
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
 * @param {Object} ownProps - The properties explicitly passed to the component instance.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state, ownProps): Object {
    const { ownerId, isSharing } = state['features/shared-iframe'];
    const localParticipantId = getLocalParticipant(state).id;
    const enabled = getFeatureFlag(state, IFRAME_SHARE_BUTTON_ENABLED, true);
    const { visible = enabled } = ownProps;

    if (ownerId !== localParticipantId) {
        return {
            _isDisabled: !isSharing,
            _sharingVideo: false,
            visible
        };
    }

    return {
        _isDisabled: false,
        _sharingVideo: isSharing,
        visible
    };
}

export default translate(connect(_mapStateToProps)(SharedIFrameButton));
