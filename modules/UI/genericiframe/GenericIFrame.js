/* global $, APP, interfaceConfig */

import {
    getGenericIFrameUrl,
    setGenericIFrameVisibilityState,
} from "../../../react/features/genericiframe";
import { getToolboxHeight } from "../../../react/features/toolbox/functions.web";
import Filmstrip from "../videolayout/Filmstrip";
import LargeContainer from "../videolayout/LargeContainer";
import VideoLayout from "../videolayout/VideoLayout";

/**
 *
 */
function bubbleIframeMouseMove(iframe) {
    const existingOnMouseMove = iframe.contentWindow.onmousemove;

    iframe.contentWindow.onmousemove = function (e) {
        if (existingOnMouseMove) {
            existingOnMouseMove(e);
        }
        const evt = document.createEvent("MouseEvents");
        const boundingClientRect = iframe.getBoundingClientRect();

        evt.initMouseEvent(
            "mousemove",
            true, // bubbles
            false, // not cancelable
            window,
            e.detail,
            e.screenX,
            e.screenY,
            e.clientX + boundingClientRect.left,
            e.clientY + boundingClientRect.top,
            e.ctrlKey,
            e.altKey,
            e.shiftKey,
            e.metaKey,
            e.button,
            null // no related element
        );
        iframe.dispatchEvent(evt);
    };
}

/**
 * Default genericiframe frame width.
 */
const DEFAULT_WIDTH = 640;

/**
 * Default genericiframe frame height.
 */
const DEFAULT_HEIGHT = 480;

const GENERICIFRAME_CONTAINER_TYPE = "genericiframe";

/**
 * Container for genericiframe iframe.
 */
class GenericIFrame extends LargeContainer {
    /**
     * Creates new GenericIFrame object
     */
    constructor(url) {
        super();
        debugger;

        const iframe = document.createElement("iframe");

        iframe.id = "genericiframe";
        iframe.src = url;
        iframe.frameBorder = 0;
        iframe.scrolling = "no";
        iframe.width = DEFAULT_WIDTH;
        iframe.height = DEFAULT_HEIGHT;
        iframe.setAttribute("style", "visibility: hidden;");

        this.container.appendChild(iframe);

        iframe.onload = function () {
            // eslint-disable-next-line no-self-assign
            document.domain = document.domain;
            bubbleIframeMouseMove(iframe);

            setTimeout(() => {
                const doc = iframe.contentDocument;

                // the iframes inside of the genericiframe are
                // not yet loaded when the genericiframe iframe is loaded
                const outer = doc.getElementsByName("ace_outer")[0];

                bubbleIframeMouseMove(outer);

                const inner = doc.getElementsByName("ace_inner")[0];

                bubbleIframeMouseMove(inner);
            }, 2000);
        };

        this.iframe = iframe;
    }

    /**
     *
     */
    get isOpen() {
        return Boolean(this.iframe);
    }

    /**
     *
     */
    get container() {
        return document.getElementById("genericiframe");
    }

    /**
     *
     */
    resize(containerWidth, containerHeight) {
        let height, width;

        if (interfaceConfig.VERTICAL_FILMSTRIP) {
            height = containerHeight - getToolboxHeight();
            width = containerWidth - Filmstrip.getVerticalFilmstripWidth();
        } else {
            height = containerHeight - Filmstrip.getFilmstripHeight();
            width = containerWidth;
        }

        $(this.iframe).width(width).height(height);
    }

    /**
     *
     */
    show() {
        const $iframe = $(this.iframe);
        const $container = $(this.container);
        const self = this;

        return new Promise((resolve) => {
            $iframe.fadeIn(300, () => {
                self.bodyBackground = document.body.style.background;
                document.body.style.background = "#eeeeee";
                $iframe.css({ visibility: "visible" });
                $container.css({ zIndex: 2 });

                APP.store.dispatch(setGenericIFrameVisibilityState(true));

                resolve();
            });
        });
    }

    /**
     *
     */
    hide() {
        const $iframe = $(this.iframe);
        const $container = $(this.container);

        document.body.style.background = this.bodyBackground;

        return new Promise((resolve) => {
            $iframe.fadeOut(300, () => {
                $iframe.css({ visibility: "hidden" });
                $container.css({ zIndex: 0 });

                APP.store.dispatch(setGenericIFrameVisibilityState(false));

                resolve();
            });
        });
    }

    /**
     * @return {boolean} do not switch on dominant speaker event if on stage.
     */
    stayOnStage() {
        return true;
    }
}

/**
 * Manager of the GenericIFrame frame.
 */
export default class GenericIFrameManager {
    /**
     *
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.genericiframe = null;
    }

    /**
     *
     */
    get isOpen() {
        return Boolean(this.genericiframe);
    }

    /**
     *
     */
    isVisible() {
        return VideoLayout.isLargeContainerTypeVisible(
            GENERICIFRAME_CONTAINER_TYPE
        );
    }

    /**
     * Create new GenericIFrame frame.
     */
    openGenericIFrame() {
        this.genericiframe = new GenericIFrame(
            getGenericIFrameUrl(APP.store.getState)
        );
        VideoLayout.addLargeVideoContainer(
            GENERICIFRAME_CONTAINER_TYPE,
            this.genericiframe
        );
    }

    /**
     * Toggle GenericIFrame frame visibility.
     * Open new GenericIFrame frame if there is no GenericIFrame frame yet.
     */
    toggleGenericIFrame() {
        if (!this.isOpen) {
            this.openGenericIFrame();
        }

        const isVisible = this.isVisible();

        VideoLayout.showLargeVideoContainer(
            GENERICIFRAME_CONTAINER_TYPE,
            !isVisible
        );

        APP.store.dispatch(setGenericIFrameVisibilityState(!isVisible));
    }
}
