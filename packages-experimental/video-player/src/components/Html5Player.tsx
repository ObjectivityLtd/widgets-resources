import * as React from "react";
import ReactResizeDetector from "react-resize-detector";

export interface Html5PlayerProps {
    url: string;
    poster?: string;
    autoPlay: boolean;
    showControls: boolean;
    loop: boolean;
    muted: boolean;
    style?: any;
    aspectRatio?: boolean;
}

export class Html5Player extends React.Component<Html5PlayerProps> {

    private videoElement: HTMLVideoElement | null = null;
    private errorElement: HTMLDivElement;
    private readonly handleOnResize = this.onResize.bind(this);

    render() {
        const sizeProps: React.CSSProperties = {
            height: !this.props.aspectRatio ? "100%" : undefined
        };
        return (
            <div className="widget-video-player-html5-container">
                <div className="video-error-label-html5" ref={(node: HTMLDivElement) => this.errorElement = node}>We are unable to show the video content :(</div>
                <video
                    className="widget-video-player-html5"
                    controls={this.props.showControls}
                    autoPlay={this.props.autoPlay}
                    muted={this.props.muted}
                    loop={this.props.loop}
                    poster={this.props.poster}
                    ref={(node: HTMLVideoElement) => this.videoElement = node }
                    {...sizeProps}>
                    <source src={this.props.url} type="video/mp4" onError={this.handleError} onLoad={this.handleSuccess}/>
                    <ReactResizeDetector handleWidth handleHeight onResize={this.handleOnResize}
                                         refreshMode="debounce" refreshRate={100} />
                </video>
            </div>
        );
    }

    private handleError(): void {
        this.errorElement.classList.add("hasError");
    }

    private handleSuccess(): void {
        this.errorElement.classList.remove("hasError");
    }

    private onResize(): void {
        if (this.videoElement && this.props.aspectRatio) {
            this.changeHeight(this.videoElement);
        }
    }

    private changeHeight(element: HTMLElement): void {
        if (element.parentElement) {
            const height = element.clientHeight + "px";
            if (element.parentElement.parentElement) {
                element.parentElement.parentElement.style.height = height;

                if (element.parentElement.parentElement.parentElement) {
                    element.parentElement.parentElement.parentElement.style.height = height;
                }
            }
        }
    }
}