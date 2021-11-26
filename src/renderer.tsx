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
    verticalAlign?: 'top' | 'middle' | 'bottom';
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

interface TextElementLine {
    x: number;
    y: number;
    line: string;
}

export class TextElement implements RenderElement {
    private text: string
    private options: TextElementOptions;

    constructor(text: string, options: TextElementOptions) {
        this.text = text;
        this.options = options;
    }

    private getLinesToRender(): Array<TextElementLine> {
        if (!this.text) {
            return [];
        }

        let lines = this.text.split('\n');
        let height = this.options.fontSize || 0;
        let lineHeight = height * 1.0;
        let firstY = this.options.y;
        if (this.options.verticalAlign === 'middle') {
            firstY -= lineHeight * (lines.length-1) / 2;
        } else if (this.options.verticalAlign === 'bottom') {
            firstY -= lineHeight * (lines.length-1);
        }
        let x = this.options.x;

        let result: Array<TextElementLine> = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let y = firstY + lineHeight * i;
            result.push({x: x, y: y, line: line});
        }

        return result;
    }

    renderToReact(key: any): React.ReactNode {
        if (!this.text) {
            return null;
        }

        let lines = this.getLinesToRender();
        let nodes: Array<ReactNode> = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            nodes.push(<BgSvgTextNode key={key} text={line.line} textProps={{
                x: line.x,
                y: line.y,
                textAnchor: this.options.textAnchor,
                fontSize: this.options.fontSize,
                fill: this.options.color,
                fontWeight: this.options.fontWeight,
                fontFamily: this.options.fontFamily,
            }} bgFill={this.options.bgFill} bgPadding={this.options.bgPadding}/>);
        }

        return <Fragment children={nodes} />;
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

        let lines = this.getLinesToRender();
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            if (this.options.bgFill) {
                let fillX = line.x;
                let fillHeight = this.options.fontSize || 0;
                let metrics = ctx.measureText(line.line);
                let width = metrics.width;
                if (this.options.textAnchor === 'middle') {
                    fillX -= width/2;
                } else if (this.options.textAnchor === 'end') {
                    fillX -= width;
                }

                let padding = this.options.bgPadding || 0;

                ctx.fillStyle = this.options.bgFill;
                ctx.fillRect(fillX - padding, line.y - fillHeight - padding, width + 2*padding, fillHeight + 2*padding);
            }

            if (this.options.color) {
                ctx.fillStyle = this.options.color;
            } else {
                ctx.fillStyle = 'black';
            }
            ctx.fillText(line.line, line.x, line.y);
        }
        return Promise.resolve();
    }
}

export interface ImageElementOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    horizontalAlign?: 'middle' | 'left' | 'right';
    verticalAlign?: 'middle' | 'top' | 'bottom';

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

        let alignment = '';
        let horizontalAlignment = this.options.horizontalAlign || 'middle';
        if (horizontalAlignment === 'left') {
            alignment = 'xMin';
        } else if (horizontalAlignment === 'right') {
            alignment = 'xMax';
        } else {
            alignment = 'xMid';
        }
        let verticalAlignment = this.options.verticalAlign || 'middle';
        if (verticalAlignment === 'top') {
            alignment += 'YMin';
        } else if (verticalAlignment === 'bottom') {
            alignment += 'YMax';
        } else {
            alignment += 'YMid';
        }
        alignment += ' meet';

        let img = <image
            key={key}
            href={this.href}
            x={this.options.x}
            y={this.options.y}
            width={this.options.width}
            height={this.options.height}
            preserveAspectRatio={alignment}>
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

                let x: number, y: number;
                let horizontalAlignment = this.options.horizontalAlign || 'middle';
                if (horizontalAlignment === 'left') {
                    x = this.options.x;
                } else if (horizontalAlignment === 'right') {
                    x = this.options.x + this.options.width - width;
                } else {
                    x = this.options.x + (this.options.width - width)/2;
                }

                let verticalAlignment = this.options.verticalAlign || 'middle';
                if (verticalAlignment === 'top') {
                    y = this.options.y;
                } else if (verticalAlignment === 'bottom') {
                    y = this.options.y + this.options.height - height;
                } else {
                    y = this.options.y + (this.options.height - height)/2;
                }

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
    render(width: number, height: number, children: Array<RenderElement>): T
}

export class ReactRenderer implements Renderer<ReactNode> {
    render(width: number, height: number, children: Array<RenderElement>): ReactNode {
        let reactChildren: Array<ReactNode> = [];
        for (let i = 0; i < children.length; i++) {
            reactChildren.push(children[i].renderToReact(i));
        }
        return <svg width="100%" viewBox={`0 0 ${width} ${height}`} children={reactChildren} />;
    }
}

export class CanvasRenderer implements Renderer<Promise<HTMLCanvasElement>> {
    render(width: number, height: number, children: Array<RenderElement>): Promise<HTMLCanvasElement> {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

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
