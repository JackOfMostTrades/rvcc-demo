import {Component, createRef, Fragment, ReactNode, RefObject, SVGProps} from "react";
import * as PDFKit from "pdfkit";
import {fetchFontTtf} from "./fonts";

export interface RenderElement {
    renderToReact(): ReactNode;
    renderToCanvas(ctx: CanvasRenderingContext2D): Promise<void>;
    renderToPdf(doc: PDFKit.PDFDocument): Promise<void>;
}

export interface TextElementOptions {
    x: number;
    y: number;
    fontSize?: number;
    color?: string,
    fontFamily?: string;
    horizontalAlign?: 'left' | 'right' | 'center';
    verticalAlign?: 'top' | 'bottom' | 'center';
    lineDistribution?: 'down' | 'up' | 'center';
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
        if (prevProps.text !== this.props.text
                || prevProps.textProps.x !== this.props.textProps.x
                || prevProps.textProps.y !== this.props.textProps.y
                || prevProps.textProps.fontFamily !== this.props.textProps.fontFamily
                || prevProps.textProps.fontSize !== this.props.textProps.fontSize) {
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
    private key: string
    private text: string
    private options: TextElementOptions;

    constructor(key: string, text: string, options: TextElementOptions) {
        this.key = key;
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
        if (this.options.verticalAlign === 'top') {
            // "top" means the 'y' coordinate should be the top of the line.
            firstY += lineHeight;
        } else if (this.options.verticalAlign === 'center') {
            firstY += lineHeight/2;
        }

        if (this.options.lineDistribution === 'center') {
            firstY -= lineHeight * (lines.length-1) / 2;
        } else if (this.options.lineDistribution === 'up') {
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

    renderToReact(): React.ReactNode {
        if (!this.text) {
            return null;
        }

        let textAnchor = 'start';
        if (this.options.horizontalAlign === 'right') {
            textAnchor = 'end';
        } else if (this.options.horizontalAlign === 'center') {
            textAnchor = 'middle';
        }

        let lines = this.getLinesToRender();
        let nodes: Array<ReactNode> = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            nodes.push(<BgSvgTextNode key={i} text={line.line} textProps={{
                x: line.x,
                y: line.y,
                textAnchor: textAnchor,
                fontSize: this.options.fontSize,
                fill: this.options.color,
                fontFamily: this.options.fontFamily,
                dominantBaseline: 'bottom',
            }} bgFill={this.options.bgFill} bgPadding={this.options.bgPadding}/>);
        }

        return <Fragment key={this.key} children={nodes} />;
    }

    renderToCanvas(ctx: CanvasRenderingContext2D): Promise<void> {
        if (!this.text) {
            return Promise.resolve();
        }

        ctx.textAlign = this.options.horizontalAlign || 'left';

        let font: string = '';
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
                let metrics = ctx.measureText(line.line);
                let rectX = line.x - metrics.actualBoundingBoxLeft;
                let width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
                let height = this.options.fontSize || 0;
                let padding = this.options.bgPadding || 0;

                ctx.fillStyle = this.options.bgFill;
                ctx.fillRect(rectX - padding, line.y - height - padding, width + 2*padding, height + 2*padding);
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

    public renderToPdf(doc: PDFKit.PDFDocument): Promise<void> {
        if (!this.text) {
            return Promise.resolve();
        }

        if (this.options.fontFamily.indexOf(',') === -1) {
            return Promise.reject("Unsupported font family: " + this.options.fontFamily);
        }
        let font = this.options.fontFamily.substring(0, this.options.fontFamily.indexOf(','));

        return fetchFontTtf(font)
            .then((fontArrayBuffer) => {
                doc.registerFont(font, fontArrayBuffer)
                doc.font(font);
                if (this.options.fontSize) {
                    doc.fontSize(this.options.fontSize);
                }

                let options: PDFKit.Mixins.TextOptions = {
                    lineBreak: false,
                    baseline: 'bottom',
                }

                let lines = this.getLinesToRender();
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    let width = doc.widthOfString(line.line, options);

                    let x = line.x
                    if (this.options.horizontalAlign === 'center') {
                        x -= width/2;
                    } else if (this.options.horizontalAlign === 'right') {
                        x -= width;
                    }

                    if (this.options.bgFill) {
                        let padding = this.options.bgPadding || 0;
                        let height = this.options.fontSize || 0;
                        doc.rect(x - padding, line.y-height-padding, width+2*padding, height+2*padding);
                        doc.fill(this.options.bgFill);
                    }

                    doc.fillColor(this.options.color || 'black');
                    doc.strokeColor(this.options.color || 'black');
                    doc.text(line.line, x, line.y, options);
                }

                return Promise.resolve();
            });
    }
}

export interface ImageElementOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    horizontalAlign?: 'center' | 'left' | 'right';
    verticalAlign?: 'center' | 'top' | 'bottom';

    bgFill?: string
    bgPadding?: number;
}

export class ImageElement implements RenderElement {
    private key: string
    private href: string;
    private options: ImageElementOptions;

    constructor(key: string, href: string, options: ImageElementOptions) {
        this.key = key;
        this.href = href;
        this.options = options;
    }

    renderToReact(): React.ReactNode {
        if (!this.href) {
            return null;
        }

        let alignment = '';
        let horizontalAlignment = this.options.horizontalAlign || 'center';
        if (horizontalAlignment === 'left') {
            alignment = 'xMin';
        } else if (horizontalAlignment === 'right') {
            alignment = 'xMax';
        } else {
            alignment = 'xMid';
        }
        let verticalAlignment = this.options.verticalAlign || 'center';
        if (verticalAlignment === 'top') {
            alignment += 'YMin';
        } else if (verticalAlignment === 'bottom') {
            alignment += 'YMax';
        } else {
            alignment += 'YMid';
        }
        alignment += ' meet';

        let img = <image
            key={this.key}
            href={this.href}
            x={this.options.x}
            y={this.options.y}
            width={this.options.width}
            height={this.options.height}
            preserveAspectRatio={alignment}>
        </image>;

        if (this.options.bgFill) {
            const bgPadding = this.options.bgPadding || 0;
            return <Fragment key={this.key}>
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
                let horizontalAlignment = this.options.horizontalAlign || 'center';
                if (horizontalAlignment === 'left') {
                    x = this.options.x;
                } else if (horizontalAlignment === 'right') {
                    x = this.options.x + this.options.width - width;
                } else {
                    x = this.options.x + (this.options.width - width)/2;
                }

                let verticalAlignment = this.options.verticalAlign || 'center';
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
        img.src = this.href;

        return promise;
    }

    renderToPdf(doc: PDFKit.PDFDocument): Promise<void> {
        if (!this.href) {
            return Promise.resolve();
        }

        let align: 'center' | 'right' | undefined;
        if (this.options.horizontalAlign === 'center') {
            align = 'center';
        } else if (this.options.horizontalAlign === 'right') {
            align = 'right';
        }
        let valign: 'center' | 'bottom' | undefined;
        if (this.options.verticalAlign === 'center') {
            valign = 'center';
        } else if (this.options.verticalAlign === 'bottom') {
            valign = 'bottom';
        }

        let dataUrlPromise: Promise<string>;
        if (this.href.indexOf('data:') === 0) {
            dataUrlPromise = Promise.resolve(this.href);
        } else {
            dataUrlPromise = new Promise((resolve, reject) => {
                let img = new Image();
                img.onload = () => {
                    let canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = (e) => {
                    reject(e);
                }
                img.src = this.href;
            });
        }

        return dataUrlPromise.then(dataurl => {
            doc.image(dataurl, this.options.x, this.options.y, {
                fit: [this.options.width, this.options.height],
                align: align,
                valign: valign,
            });
        });
    }
}

export interface Renderer<T> {
    render(width: number, height: number, children: Array<RenderElement>): T
}

export class ReactRenderer implements Renderer<ReactNode> {
    render(width: number, height: number, children: Array<RenderElement>): ReactNode {
        let reactChildren: Array<ReactNode> = [];
        for (let i = 0; i < children.length; i++) {
            reactChildren.push(children[i].renderToReact());
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

export class PdfRenderer implements Renderer<Promise<PDFKit.PDFDocument>> {
    render(width: number, height: number, children: Array<RenderElement>): Promise<PDFKit.PDFDocument> {
        const doc: PDFKit.PDFDocument = new PDFDocument({
            size: [width, height],
            margins: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            },
        });
        let chain: Promise<void> = Promise.resolve();
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            chain = chain.then(() => child.renderToPdf(doc));
        }
        return chain.then(() => {
            return doc;
        });
    }
}
