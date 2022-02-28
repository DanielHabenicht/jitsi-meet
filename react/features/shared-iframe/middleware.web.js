// @flow

import { getCurrentConference } from '../base/conference';
import { getLocalParticipant } from '../base/participants';
import { StateListenerRegistry } from '../base/redux';

import { setDisableButton } from './actions.web';
import { SHARED_IFRAME } from './constants';

import './middleware.any';

/**
 * Set up state change listener to disable or enable the share video button in
 * the toolbar menu.
 */
StateListenerRegistry.register(
    state => getCurrentConference(state),
    (conference, store, previousConference) => {
        if (conference && conference !== previousConference) {
            debugger;

            conference.addCommandListener(SHARED_IFRAME,
                ({ attributes }) => {
                    const { dispatch, getState } = store;
                    const { from } = attributes;
                    const localParticipantId = getLocalParticipant(getState()).id;
                    const isSharing = attributes.isSharing;

                    if (isSharing === 'true') {
                        if (localParticipantId !== from) {
                            dispatch(setDisableButton(true));
                        }
                    } else if (isSharing !== 'true') {
                        dispatch(setDisableButton(false));
                    }
                }
            );
        }
    }
);
