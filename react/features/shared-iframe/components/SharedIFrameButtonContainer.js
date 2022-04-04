// @flow

import { PureComponent } from 'react';

import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import SharedIFrameButton from './SharedIFrameButton';

type Props = AbstractButtonProps & {

    /**
     * The sharedIFrame Buttons to be displayed
     */
    _buttons: any[],

};

/**
 * Implements an {@link AbstractButton} to open the user documentation in a new window.
 */
class SharedIFrameButtonContainer extends PureComponent<Props> {

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {React$Element}
     */
      render() {
        const { _buttons } = this.props;

        return (
            _buttons.map(button => {
                return (<SharedIFrameButton></SharedIFrameButton>)
            })
        );
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
    const sharedIFrame = state['features/base/config'];


    return {
        _buttons: sharedIFrame,
    };
}


export default translate(connect(_mapStateToProps)(SharedIFrameButtonContainer));
