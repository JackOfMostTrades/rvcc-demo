import {Component, createRef, Fragment, ReactNode, RefObject, SVGProps} from "react";
import * as PDFKit from "pdfkit";
import {fetchFontTtf} from "./fonts";
import ImageOption = PDFKit.Mixins.ImageOption;

export interface RenderElement {
    renderToReact(): ReactNode;
    renderToCanvas(ctx: CanvasRenderingContext2D): Promise<void>;
    renderToPdf(doc: PDFKit.PDFDocument): Promise<void>;
}

export interface TextContainerOptions {
    x: number;
    y: number;
    horizontalAlign?: 'left' | 'right' | 'center';
    lineDistribution?: 'down' | 'up' | 'center';
    bgFill?: string;
    bgPadding?: number;
}

export interface TextContainerLine {
    text: string
    fontSize?: number;
    color?: string,
    fontFamily?: string;
}

export class TextContainer implements RenderElement {
    private key: string;
    private lines: TextContainerLine[];
    private options: TextContainerOptions;

    constructor(key: string, lines: TextContainerLine[], options: TextContainerOptions) {
        this.key = key;
        this.lines = lines;
        this.options = options;
    }

    private computeBbox(line: TextContainerLine): {width: number, height: number} {
        let hiddenDiv = document.createElement('div');
        hiddenDiv.style.opacity = '0';
        document.body.appendChild(hiddenDiv);

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', "0 0 200 200");
        let textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textNode.setAttribute('x', '0');
        textNode.setAttribute('y', '0');
        textNode.setAttribute('font-size', '' + (line.fontSize || 0));
        textNode.setAttribute('fill', line.color);
        textNode.setAttribute('font-family', line.fontFamily);
        textNode.appendChild(document.createTextNode(line.text));
        svg.appendChild(textNode);
        hiddenDiv.appendChild(svg);

        let bbox = textNode.getBBox();
        document.body.removeChild(hiddenDiv);

        return {width: bbox.width, height: bbox.height};
    }

    renderGeneric(getExtents: (line: TextContainerLine) => {width: number, height: number},
                  drawRect: (color: string|undefined, x: number, y: number, width: number, height: number) => void,
                  drawText: (text: string, x: number, y: number, fontSize: number, color: string|undefined, fontFamily: string, horizontalAlign: 'right'|'center'|'left'|undefined) => void) {
        if (this.lines.length === 0) {
            return;
        }

        let bboxes: Array<{width: number, height: number}> = [];
        for (let i = 0; i < this.lines.length; i++) {
            bboxes[i] = getExtents(this.lines[i]);
        }
        let maxWidth = 0;
        let totalHeight = 0;
        for (let i = 0; i < bboxes.length; i++) {
            maxWidth = Math.max(maxWidth, bboxes[i].width);
            totalHeight += bboxes[i].height;
        }

        let x = this.options.x;
        let y = this.options.y;
        if (this.options.horizontalAlign === 'right') {
            x -= maxWidth;
        } else if (this.options.horizontalAlign === 'center') {
            x -= maxWidth/2;
        }
        if (this.options.lineDistribution === 'up') {
            y -= totalHeight;
        } else if (this.options.lineDistribution === 'center') {
            y -= totalHeight/2;
        }

        if (this.options.bgFill) {
            let padding = this.options.bgPadding || 0;
            drawRect(this.options.bgFill, x-padding, y-padding, maxWidth + 2*padding, totalHeight + 2*padding);
        }

        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            y += bboxes[i].height;
            drawText(line.text, this.options.x, y, line.fontSize, line.color, line.fontFamily, this.options.horizontalAlign);
        }
    }

    renderToReact(): React.ReactNode {
        let nodes: Array<React.ReactNode> = [];
        this.renderGeneric(line => this.computeBbox(line),
            (color, x, y, width, height) => nodes.push(
                <rect fill={color} x={x} y={y} width={width} height={height}/>),
            (text, x, y, fontSize, color, fontFamily, horizontalAlign1) => {
                let textAnchor = 'start';
                if (this.options.horizontalAlign === 'right') {
                    textAnchor = 'end';
                } else if (this.options.horizontalAlign === 'center') {
                    textAnchor = 'middle';
                }
                nodes.push(<text x={x} y={y} fontSize={fontSize} fill={color} fontFamily={fontFamily} textAnchor={textAnchor}>{text}</text>);
            });
        return nodes;
    }

    renderToCanvas(ctx: CanvasRenderingContext2D): Promise<void> {
        ctx.textBaseline = 'bottom';
        let setFontOnCtx = (fontSize: number|undefined, fontFamily: string|undefined) => {
            let font: string = '';
            if (fontSize) {
                font += fontSize + 'px ';
            }
            if (fontFamily) {
                font += fontFamily;
            }
            if (font) {
                ctx.font = font;
            }
        };
        let getExtents = (line: TextContainerLine) => {
            setFontOnCtx(line.fontSize, line.fontFamily);
            let metrics = ctx.measureText(line.text);
            return {width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
                height: line.fontSize}
        };
        let drawRect = (color: string|undefined, x: number, y: number, width: number, height: number) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        };
        let drawText = (text: string, x: number, y: number, fontSize: number, color: string|undefined, fontFamily: string, horizontalAlign: 'right'|'center'|'left'|undefined) => {
            setFontOnCtx(fontSize, fontFamily);
            ctx.textAlign = horizontalAlign || 'left';
            if (color) {
                ctx.fillStyle = color;
            } else {
                ctx.fillStyle = 'black';
            }
            ctx.fillText(text, x, y);
        };

        this.renderGeneric(getExtents, drawRect, drawText);
        return Promise.resolve();
    }

    public renderToPdf(doc: PDFKit.PDFDocument): Promise<void> {
        let options: PDFKit.Mixins.TextOptions = {
            lineBreak: false,
            baseline: 'bottom',
        }

        let getFontNameFromFamily = (fontFamily: string|undefined): string => {
            if (fontFamily.indexOf(',') === -1) {
                return fontFamily;
            }
            return fontFamily.substring(0, fontFamily.indexOf(','));
        }
        let setFontOnDoc = (fontSize: number|undefined, fontFamily: string|undefined) => {
            let font = getFontNameFromFamily(fontFamily);
            doc.font(fontFamily);
            if (fontSize) {
                doc.fontSize(fontSize);
            }
        };
        let getExtents = (line: TextContainerLine) => {
            setFontOnDoc(line.fontSize, line.fontFamily);
            let width = doc.widthOfString(line.text, options);
            let height = doc.heightOfString(line.text, options);
            return {width: width, height: height};
        };
        let drawRect = (color: string|undefined, x: number, y: number, width: number, height: number) => {
            doc.rect(x, y, width, height);
            doc.fill(color);
        };
        let drawText = (text: string, x: number, y: number, fontSize: number, color: string|undefined, fontFamily: string, horizontalAlign: 'right'|'center'|'left'|undefined) => {
            setFontOnDoc(fontSize, fontFamily);

            let width = doc.widthOfString(text, options);
            if (this.options.horizontalAlign === 'center') {
                x -= width/2;
            } else if (this.options.horizontalAlign === 'right') {
                x -= width;
            }

            doc.fillColor(color || 'black');
            doc.strokeColor(color || 'black');
            doc.text(text, x, y, options);
        };

        let promise: Promise<void> = Promise.resolve();
        this.lines.forEach(line => {
            let font = getFontNameFromFamily(line.fontFamily);
            promise = promise.then(() => fetchFontTtf(font).then((fontArrayBuffer) => {doc.registerFont(font, fontArrayBuffer);}));
        });

        return promise.then(() => {
            this.renderGeneric(getExtents, drawRect, drawText);
        })
    }
}

export interface ImageElementOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    horizontalAlign?: 'center' | 'left' | 'right';
    verticalAlign?: 'center' | 'top' | 'bottom';
    scaleStrategy?: 'fit' | 'fill'

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
        if (this.options.scaleStrategy === 'fill') {
            alignment += ' slice';
        } else {
            alignment += ' meet';
        }

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
                if (this.options.scaleStrategy === 'fill') {
                    let scale = Math.max(this.options.width / img.naturalWidth, this.options.height / img.naturalHeight);
                    let width = scale * img.naturalWidth;
                    let height = scale * img.naturalHeight;

                    let srcX: number, srcY: number;
                    let horizontalAlignment = this.options.horizontalAlign || 'center';
                    if (horizontalAlignment === 'left') {
                        srcX = 0;
                    } else if (horizontalAlignment === 'right') {
                        srcX = width - this.options.width;
                    } else {
                        srcX = (width - this.options.width)/2;
                    }

                    let verticalAlignment = this.options.verticalAlign || 'center';
                    if (verticalAlignment === 'top') {
                        srcY = 0;
                    } else if (verticalAlignment === 'bottom') {
                        srcY = height - this.options.height;
                    } else {
                        srcY = (height - this.options.height)/2;
                    }

                    ctx.drawImage(img, srcX/scale, srcY/scale, this.options.width/scale, this.options.height/scale,
                            this.options.x, this.options.y, this.options.width, this.options.height);

                } else {
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
                        x = this.options.x + (this.options.width - width) / 2;
                    }

                    let verticalAlignment = this.options.verticalAlign || 'center';
                    if (verticalAlignment === 'top') {
                        y = this.options.y;
                    } else if (verticalAlignment === 'bottom') {
                        y = this.options.y + this.options.height - height;
                    } else {
                        y = this.options.y + (this.options.height - height) / 2;
                    }

                    ctx.drawImage(img, x, y, width, height);
                }
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
            let options: ImageOption = {
                align: align,
                valign: valign,
            };
            if (this.options.scaleStrategy === 'fill') {
                options.cover = [this.options.width, this.options.height];
            } else {
                options.fit = [this.options.width, this.options.height];
            }
            doc.image(dataurl, this.options.x, this.options.y, options);
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
