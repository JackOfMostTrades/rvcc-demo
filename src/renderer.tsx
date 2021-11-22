import {Component, createRef, ReactNode, Fragment, ReactSVGElement, Ref, RefObject, SVGProps} from "react";

export interface RenderElement {
    renderToReact(key: any): ReactNode;
    renderToCanvas(ctx: CanvasRenderingContext2D): Promise<void>;
}

export interface TextElementOptions {
    x: number;
    y: number;
    textAnchor?: 'start' | 'end' | 'middle';
    fontSize?: number;
    color?: string,
    fontWeight?: 'bold';
    fontFamily?: string;
    bgFill?: string;
    bgPadding?: number;
}

interface BgSvgTextNodeProps {
    text: string;
    textProps: SVGProps<SVGTextElement>;
    bgFill?: string;
    bgPadding?: number;
}

class BgSvgTextNode extends Component<BgSvgTextNodeProps, {extents?: DOMRect}> {
    private ref: RefObject<SVGTextElement>;

    constructor(props: BgSvgTextNodeProps) {
        super(props);
        this.ref = createRef();
        this.state = {};
    }

    componentDidMount() {
        this.updateExtents();
    }

    componentDidUpdate(prevProps: BgSvgTextNodeProps) {
        if (prevProps.text !== this.props.text) {
            this.updateExtents();
        }
    }

    private updateExtents() {
        this.setState({extents: this.ref.current.getBBox()});
    }

    render() {
        const margin = this.props.bgPadding || 0;
        const extents = this.state.extents;

        let outline: ReactNode;
        if (this.props.bgFill && extents) {
            outline = <rect fill={this.props.bgFill} x={extents.x - margin} y = {extents.y - margin } width={extents.width + 2 * margin} height={extents.height + 2 * margin} />;
        }
        return <Fragment>{outline}<text ref={this.ref} {...this.props.textProps}>{this.props.text}</text></Fragment>;
    }
}

export class TextElement implements RenderElement {
    private text: string
    private options: TextElementOptions;

    constructor(text: string, options: TextElementOptions) {
        this.text = text;
        this.options = options;
    }

    renderToReact(key: any): React.ReactNode {
        if (!this.text) {
            return null;
        }

        return <BgSvgTextNode key={key} text={this.text} textProps={{
            x: this.options.x,
            y: this.options.y,
            textAnchor: this.options.textAnchor,
            fontSize: this.options.fontSize,
            fill: this.options.color,
            fontWeight: this.options.fontWeight,
            fontFamily: this.options.fontFamily,
        }} bgFill={this.options.bgFill} bgPadding={this.options.bgPadding} />;
    }

    renderToCanvas(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.options.textAnchor === 'middle') {
            ctx.textAlign = 'center';
        } else if (this.options.textAnchor === 'end') {
            ctx.textAlign = 'right';
        } else {
            ctx.textAlign = 'left';
        }

        let font: string = '';
        if (this.options.fontWeight) {
            font += this.options.fontWeight + ' ';
        }
        if (this.options.fontSize) {
            font += this.options.fontSize + 'px ';
        }
        if (this.options.fontFamily) {
            font += this.options.fontFamily;
        }
        if (font) {
            ctx.font = font;
        }

        if (this.options.bgFill) {
            let metrics = ctx.measureText(this.text);
            let height = this.options.fontSize || 0;
            let width = metrics.width;
            let x = this.options.x;
            let y = this.options.y - height;
            if (this.options.textAnchor === 'middle') {
                x -= width/2;
            } else if (this.options.textAnchor === 'end') {
                x -= width;
            }

            ctx.fillStyle = this.options.bgFill;
            ctx.fillRect(x, y, width, height);
        }

        if (this.options.color) {
            ctx.fillStyle = this.options.color;
        } else {
            ctx.fillStyle = 'black';
        }
        ctx.fillText(this.text, this.options.x, this.options.y);

        return Promise.resolve();
    }
}

export interface ImageElementOptions {
    x: number;
    y: number;
    width: number;
    height: number;

    bgFill?: string
    bgPadding?: number;
}

export class ImageElement implements RenderElement {
    private href: string;
    private options: ImageElementOptions;

    constructor(href: string, options: ImageElementOptions) {
        this.href = href;
        this.options = options;
    }

    renderToReact(key: any): React.ReactNode {
        if (!this.href) {
            return null;
        }

        let img = <image
            key={key}
            href={this.href}
            x={this.options.x}
            y={this.options.y}
            width={this.options.width}
            height={this.options.height}>
        </image>;

        if (this.options.bgFill) {
            const bgPadding = this.options.bgPadding || 0;
            return <Fragment>
                <rect x={this.options.x - bgPadding}
                      y={this.options.y - bgPadding}
                      width={this.options.width + 2*bgPadding}
                      height={this.options.height + 2*bgPadding}
                      fill={this.options.bgFill} />
                {img}
            </Fragment>
        }

        return img;
    }

    renderToCanvas(ctx: CanvasRenderingContext2D): Promise<void> {
        if (!this.href) {
            return Promise.resolve();
        }

        if (this.options.bgFill) {
            ctx.fillStyle = this.options.bgFill;
            let padding = this.options.bgPadding || 0;
            ctx.fillRect(this.options.x - padding, this.options.y - padding, this.options.width + 2*padding, this.options.height + 2*padding);
        }

        let img = new Image(this.options.width, this.options.height);
        let promise = new Promise<void>((resolve, reject) => {
            img.onload = () => {
                let scale = Math.min(this.options.width / img.naturalWidth, this.options.height / img.naturalHeight);
                let width = scale * img.naturalWidth;
                let height = scale * img.naturalHeight;
                let x = this.options.x + (this.options.width - width)/2;
                let y = this.options.y + (this.options.height - height)/2;

                ctx.drawImage(img, x, y, width, height);
                resolve();
            };
            img.onerror = () => {
                reject();
            }
        });

        if (this.href === 'bg-thumbnail.jpg') {
            img.src = 'bg.png';
        } else {
            img.src = this.href;
        }

        return promise;
    }
}

export interface Renderer<T> {
    render(children: Array<RenderElement>): T
}

export class ReactRenderer implements Renderer<ReactNode> {
    render(children: Array<RenderElement>): ReactNode {
        let reactChildren: Array<ReactNode> = [];
        for (let i = 0; i < children.length; i++) {
            reactChildren.push(children[i].renderToReact(i));
        }
        return <svg width="100%" viewBox="0 0 1571 2000" children={reactChildren} />;
    }
}

export class CanvasRenderer implements Renderer<Promise<HTMLCanvasElement>> {
    render(children: Array<RenderElement>): Promise<HTMLCanvasElement> {
        let canvas = document.createElement('canvas');
        canvas.width = 1571;
        canvas.height = 2000;

        let chain: Promise<void> = Promise.resolve();
        let ctx = canvas.getContext('2d');
        ctx.textBaseline = 'bottom';
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            chain = chain.then(() => child.renderToCanvas(ctx));
        }
        return chain.then(() => {
            return canvas;
        });
    }
}
