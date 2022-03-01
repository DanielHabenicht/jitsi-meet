// @flow

import React, { Component } from 'react';
import { View } from 'react-native';

import { getLocalParticipant } from '../../../base/participants';
import { connect } from '../../../base/redux';
import { ASPECT_RATIO_WIDE } from '../../../base/responsive-ui';
import { setToolboxVisible } from '../../../toolbox/actions';

import styles from './styles';

/**
 * Default genericiframe frame width.
 */
const DEFAULT_WIDTH = 640;

/**
  * Default genericiframe frame height.
  */
const DEFAULT_HEIGHT = 480;

type Props = {

    /**
     * The Redux dispatch function.
     */
     dispatch: Function,

    /**
     * Is the video shared by the local user.
     *
     * @private
     */
    isOwner: boolean,

    /**
     * True if in landscape mode.
     *
     * @private
     */
    isWideScreen: boolean,

    /**
     * The available player width.
     */
    playerHeight: number,

    /**
     * The available player width.
     */
    playerWidth: number,

    /**
     * The shared video url.
     */
     iFrameUrl: string,
}

/** .
 * Implements a React {@link Component} which represents the large video (a.k.a.
 * The conference participant who is on the local stage) on Web/React.
 *
 * @augments Component
 */
class SharedIFrame extends Component<Props> {
    /**
     * Initializes a new {@code SharedIFrame} instance.
     *
     * @param {Object} props - The properties.
     */
    constructor(props: Props) {
        super(props);

        this.setWideScreenMode(props.isWideScreen);
        const iframe = document.createElement('iframe');

        iframe.id = 'genericiframe';
        iframe.src = props.iFrameUrl;
        iframe.frameBorder = 0;
        iframe.scrolling = 'no';
        iframe.width = DEFAULT_WIDTH;
        iframe.height = DEFAULT_HEIGHT;
        iframe.setAttribute('style', 'visibility: hidden;');

        this.container.appendChild(iframe);
        this.iframe = iframe;
    }

    /**
     * Implements React's {@link Component#componentDidUpdate()}.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidUpdate(prevProps: Props) {
        const { isWideScreen } = this.props;

        if (isWideScreen !== prevProps.isWideScreen) {
            this.setWideScreenMode(isWideScreen);
        }
    }

    /**
     * Dispatches action to set the visibility of the toolbox, true if not widescreen, false otherwise.
     *
     * @param {isWideScreen} isWideScreen - Whether the screen is wide.
     * @private
     * @returns {void}
    */
    setWideScreenMode(isWideScreen) {
        this.props.dispatch(setToolboxVisible(!isWideScreen));
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {React$Element}
     */
    render() {
        const {
            isOwner,
            playerHeight,
            playerWidth,
            iFrameUrl
        } = this.props;

        if (!iFrameUrl) {
            return null;
        }

        return (
            <View
                pointerEvents = { isOwner ? 'auto' : 'none' }
                style = { styles.videoContainer } >
                <div>Native</div>
                ${this.iframe}
                {/* {videoUrl.match(/http/)
                    ? (
                        <VideoManager
                            height = { playerHeight }
                            videoId = { videoUrl }
                            width = { playerWidth } />
                    ) : (
                        <YoutubeVideoManager
                            height = { playerHeight }
                            videoId = { videoUrl }
                            width = { playerWidth } />
                    )
                } */}
            </View>
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated LargeVideo props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const { ownerId, videoUrl } = state['features/shared-iframe'];
    const { aspectRatio, clientHeight, clientWidth } = state['features/base/responsive-ui'];

    const isWideScreen = aspectRatio === ASPECT_RATIO_WIDE;
    const localParticipant = getLocalParticipant(state);

    let playerHeight, playerWidth;

    if (isWideScreen) {
        playerHeight = clientHeight;
        playerWidth = playerHeight * 16 / 9;
    } else {
        playerWidth = clientWidth;
        playerHeight = playerWidth * 9 / 16;
    }

    return {
        isOwner: ownerId === localParticipant.id,
        isWideScreen,
        playerHeight,
        playerWidth,
        videoUrl
    };
}

export default connect(_mapStateToProps)(SharedIFrame);
