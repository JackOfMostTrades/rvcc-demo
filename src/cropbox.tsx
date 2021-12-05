import {Component, Fragment} from "react";
import {Button, Loader, Modal} from "semantic-ui-react";
import ReactCrop from "react-image-crop";

export interface Props {
    href: string;
    aspect: number|undefined
    onComplete: (dataUrl: string) => void
}

interface State {
    img?: HTMLImageElement
    x?: number
    y?: number
    width?: number
    height?: number
}

export class CropBox extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.reset();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (this.props.href !== prevProps.href) {
            this.reset();
            if (this.props.href) {
                let img = new Image();
                img.onload = () => {
                    let width = 100;
                    let height = 100;
                    if (this.props.aspect) {
                        if (this.props.aspect < img.naturalWidth / img.naturalHeight) {
                            width = (img.naturalHeight * this.props.aspect) / img.naturalWidth * 100.0;
                        } else {
                            height = (img.naturalWidth / this.props.aspect) / img.naturalHeight * 100.0;
                        }
                    }
                    this.setState({
                        img: img,
                        x: 0,
                        y: 0,
                        width: width,
                        height: height,
                    });
                }
                img.src = this.props.href;
            }
        }
    }

    private reset() {
        this.setState({
            img: undefined,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        });
    }

    private doComplete() {
        let img = this.state.img;
        const x = (this.state.x || 0)/100.0 * img.naturalWidth;
        const y = (this.state.y || 0)/100.0 * img.naturalHeight;
        const width = (this.state.width || 100)/100.0 * img.naturalWidth;
        const height = (this.state.height || 100)/100.0 * img.naturalHeight;
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, x, y, width, height,
            0, 0, width, height);
        this.props.onComplete(canvas.toDataURL('image/png'));
    }

    render() {
        return <Modal
            onClose={() => this.props.onComplete("")}
            open={!!this.props.href}>
            <Modal.Header>Crop Your Image</Modal.Header>
            <Modal.Content>
                {this.state.img ? <Fragment>
                    <p>Drag to crop your image, or just click "Use this image" to continue.</p>
                    <ReactCrop
                        src={this.props.href}
                        imageStyle={{maxWidth: '300px', maxHeight: '300px', width: 'auto', height: 'auto'}}
                        crop={{
                            x: this.state.x,
                            y: this.state.y,
                            width: this.state.width,
                            height: this.state.height,
                            aspect: this.props.aspect,
                            unit: '%',
                        }}
                        onChange={(crop, percentageCrop) => {
                            this.setState({
                                x: percentageCrop.x,
                                y: percentageCrop.y,
                                width: percentageCrop.width,
                                height: percentageCrop.height,
                            })
                        }} />
                </Fragment> : <Loader active inline='centered' /> }
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