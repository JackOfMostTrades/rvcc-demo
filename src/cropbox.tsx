import {Component, MouseEvent} from "react";
import {Button, Container, Dimmer, Image as SemanticImage, Loader, Modal} from "semantic-ui-react";

export interface Props {
    href: string;
    onComplete: (dataUrl: string) => void
}

enum Corner {
    NONE,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
}

interface State {
    loadedImage?: HTMLImageElement;
    x?: number;
    y?: number;
    dx?: number;
    dy?: number;
    dragging?: Corner;
}

export class CropBox extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
            dx: 1.0,
            dy: 1.0,
            dragging: Corner.NONE,
        };
    }

    componentDidMount() {
        this.reset();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (this.props.href !== prevProps.href) {
            this.reset();
        }
    }

    private reset() {
        this.setState({
            x: 0,
            y: 0,
            dx: 1.0,
            dy: 1.0,
            dragging: Corner.NONE,
            loadedImage: undefined,
        });

        if (this.props.href) {
            let img = new Image();
            img.onload = () => {
                if (img.src === this.props.href) {
                    this.setState({
                        loadedImage: img,
                    });
                }
            };
            img.src = this.props.href;
        }
    }

    private startDragging(corner: Corner) {
        this.setState({dragging: corner});
    }

    private stopDragging() {
        this.setState({dragging: Corner.NONE});
    }

    private doDrag(ev: MouseEvent<HTMLDivElement>) {
        if (this.state.dragging === Corner.NONE) {
            return false;
        }
        let rect = ev.currentTarget.getBoundingClientRect();
        let x = (ev.clientX - rect.x) / rect.width;
        let y = (ev.clientY - rect.y) / rect.height;
        console.log("x=" + x + ", y=" + y);
        if (this.state.dragging === Corner.TOP_LEFT) {
            let newX = Math.min(this.state.dx, Math.max(x, 0));
            let newY = Math.min(this.state.dy, Math.max(y, 0));
            this.setState({x: newX, y: newY});
        }
        if (this.state.dragging === Corner.TOP_RIGHT) {
            let newDX = Math.max(this.state.x, Math.min(x, 1.0));
            let newY = Math.min(this.state.dy, Math.max(y, 0));
            this.setState({dx: newDX, y: newY});
        }
        if (this.state.dragging === Corner.BOTTOM_LEFT) {
            let newX = Math.min(this.state.dx, Math.max(x, 0));
            let newDY = Math.max(this.state.y, Math.min(y, 1.0));
            this.setState({x: newX, dy: newDY});
        }
        if (this.state.dragging === Corner.BOTTOM_RIGHT) {
            let newDX = Math.max(this.state.x, Math.min(x, 1.0));
            let newDY = Math.max(this.state.y, Math.min(y, 1.0));
            this.setState({dx: newDX, dy: newDY});
        }
        return false;
    }

    private doComplete() {
        let img = this.state.loadedImage;
        if (!img) {
            throw new Error("Should only be reachable if image is loaded.");
        }
        let actualWidth = (this.state.dx-this.state.x) * img.naturalWidth;
        let actualHeight = (this.state.dy-this.state.y) * img.naturalHeight;

        let canvas = document.createElement('canvas');
        canvas.width = actualWidth;
        canvas.height = actualHeight;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, this.state.x * img.naturalWidth, this.state.y * img.naturalHeight,
            actualWidth, actualHeight, 0, 0, actualWidth, actualHeight);
        this.props.onComplete(canvas.toDataURL('image/png'));
    }

    render() {
        return <Modal
            onClose={() => this.props.onComplete("")}
            open={!!this.props.href}>
            <Modal.Header>Crop Your Image</Modal.Header>
            <Modal.Content>
                {this.state.loadedImage ?
                    <Container fluid textAlign="center" style={{msUserSelect: 'none', userSelect: 'none'}}>
                        <div style={{width: "100%"}} onMouseUp={() => this.stopDragging()}>
                            <div style={{position: 'relative', display: 'inline-block'}}
                                 onMouseMove={(e) => this.doDrag(e)}>
                                <SemanticImage style={{maxWidth: "100%", maxHeight: "300px", width: 'auto', height: 'auto'}} src={this.props.href} />
                                <div style={{position: 'absolute', left: (this.state.x * 100.0).toString() + "%", top: (this.state.y * 100.0).toString() + "%",
                                    borderTop: '2px solid blue', borderLeft: '2px solid blue', cursor: 'nwse-resize',
                                    width: '20px', height: '20px'}}
                                     onMouseDown={() => this.startDragging(Corner.TOP_LEFT)}
                                />
                                <div style={{position: 'absolute', right: ((1.0 - this.state.dx) * 100.0).toString() + "%", top: (this.state.y * 100.0).toString() + "%",
                                    borderTop: '2px solid blue', borderRight: '2px solid blue', cursor: 'nesw-resize',
                                    width: '20px', height: '20px'}}
                                     onMouseDown={() => this.startDragging(Corner.TOP_RIGHT)}
                                />
                                <div style={{position: 'absolute', left: (this.state.x * 100.0).toString() + "%", bottom: ((1.0 - this.state.dy) * 100.0).toString() + "%",
                                    borderBottom: '2px solid blue', borderLeft: '2px solid blue', cursor: 'nesw-resize',
                                    width: '20px', height: '20px'}}
                                     onMouseDown={() => this.startDragging(Corner.BOTTOM_LEFT)}
                                />
                                <div style={{position: 'absolute', right: ((1.0 - this.state.dx) * 100.0).toString() + "%", bottom: ((1.0 - this.state.dy) * 100.0).toString() + "%",
                                    borderBottom: '2px solid blue', borderRight: '2px solid blue', cursor: 'nwse-resize',
                                    width: '20px', height: '20px'}}
                                     onMouseDown={() => this.startDragging(Corner.BOTTOM_RIGHT)}
                                />
                            </div>
                        </div>
                    </Container>
                    :
                    <Dimmer active inverted><Loader /></Dimmer>
                }
            </Modal.Content>
            <Modal.Actions>
                <Button color='black' onClick={() => this.props.onComplete("")}>
                    Cancel
                </Button>
                <Button
                    content="Use this image"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={() => this.doComplete()}
                    positive
                />
            </Modal.Actions>
        </Modal>;
    }
}