import {Component, ReactNode} from 'react';
import {
  Button,
  Checkbox,
  Container,
  Form,
  Grid,
  Header,
  Icon,
  Image,
  Input,
  Segment,
  Select,
  TextArea
} from "semantic-ui-react";
import {
  CanvasRenderer,
  ImageElement,
  PdfRenderer,
  ReactRenderer,
  RenderElement,
  TextContainer,
  TextContainerLine
} from "./renderer";
import {CropBox} from "./cropbox";
import {FONTS} from "./fonts";
import {Campaign, ImageSpec, TextSpec} from "./model";
import ColorPicker from "./color_picker";

const format = require("string-template");

export interface Props {
  campaign: Campaign
}

interface State {
  background?: number
  size?: number
  language?: number
  website?: string
  website_font_size?: number
  program_info?: string
  program_info_font_size?: number
  logo?: string
  use_default_pic?: boolean
  picture?: string
  font?: string
  fontColor?: string

  cropModalHref?: string
  cropModalCallback?: (dataUrl: string) => void
  cropModalAspectRatio?: number
}

class ImageSelectFormField extends Component<{value?: string, disabled?: boolean, clear: () => void, setImage: (files: FileList) => void}, {}> {
  render() {
    if (this.props.value) {
      return <Segment clearing>
        <Image src={this.props.value} size="tiny" floated="left"/>
        <Button color="red" floated="right" icon labelPosition="left" onClick={() => this.props.clear()}>
          <Icon name="x"/>Clear
        </Button>
      </Segment>;
    }
    return <Input disabled={this.props.disabled} type="file" onChange={e => this.props.setImage(e.target.files)} />;
  }
}

export class TemplateForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      background: 0,
      size: 0,
      language: 0,
      website: "",
      website_font_size: 55,
      program_info: "",
      program_info_font_size: 55,
      use_default_pic: true,
      font: 'Quicksand',
      fontColor: "#000000",
    };
    this.setImage = this.setImage.bind(this);
  }

  private reset() {
    this.setState({
      background: 0,
      size: 0,
      language: 0,
      website: "",
      website_font_size: 55,
      program_info: "",
      program_info_font_size: 55,
      logo: undefined,
      picture: undefined,
      use_default_pic: true,
      font: 'Quicksand',
      fontColor: '#000000',
      cropModalHref: undefined,
      cropModalCallback: undefined,
      cropModalAspectRatio: undefined,
    });
  }

  private setImage(fieldName: 'logo' | 'picture', files: FileList) {
    if (!files || files.length === 0) {
      this.setState({[fieldName]: undefined});
      return;
    }
    let self = this;
    let file = files[0];
    if (file.type && file.type.indexOf('image/') !== 0) {
      alert("File is not an image: " + file.type);
      return;
    }

    let spec: ImageSpec = this.props.campaign.sizes[this.state.size][fieldName];
    let aspect: number|undefined;
    if (spec && spec.enforceAspectRatio) {
      aspect = spec.width / spec.height;
    }

    let reader = new FileReader();
    reader.addEventListener('load', function (e) {
      self.setState({
        cropModalHref: e.target.result as string,
        cropModalCallback: (dataUrl) => {
          self.setState({cropModalHref: undefined, cropModalCallback: undefined, [fieldName]: dataUrl});
        },
        cropModalAspectRatio: aspect,
      });
    });
    reader.readAsDataURL(file);
  }

  private downloadPng() {
    let size = this.props.campaign.sizes[this.state.size];
    let canvasPromise = new CanvasRenderer().render(size.width, size.height, this.getRenderChildren());
    canvasPromise.then(canvas => {
      let image = canvas.toDataURL("image/png");
      let link = document.createElement("a");
      link.download = 'foo.png';
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(err => {
      alert(err);
    });
  }

  private downloadPdf() {
    let size = this.props.campaign.sizes[this.state.size];
    let docPromise = new PdfRenderer().render(size.width, size.height, this.getRenderChildren());
    docPromise.then(doc => {
      const stream = doc.pipe(blobStream());
      stream.on('finish', () => {
        let image = stream.toBlobURL("application/pdf");
        let link = document.createElement("a");
        link.download = 'foo.pdf';
        link.href = image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      doc.end();
    }).catch(err => {
      alert(err);
    });
  }


  private toImageElement(key: string, spec: ImageSpec|undefined, href: string|undefined): ImageElement|undefined {
    if (!spec || !href) {
      return undefined;
    }
    let background = this.props.campaign.backgrounds[this.state.background];
    return new ImageElement(key, href, {
      x: spec.x,
      y: spec.y,
      width: spec.width,
      height: spec.height,
      horizontalAlign: spec.horizontalAlignment,
      verticalAlign: spec.verticalAlignment,
      scaleStrategy: spec.scaleStrategy,
      bgFill: spec.includeBackgroundFill ? background.color : undefined,
      bgPadding: 0,
    });
  }

  private toTextElement(key: string,
                        spec: TextSpec|undefined,
                        options: {fontSize?: number},
                        lines: Array<TextContainerLine>): TextContainer|undefined {
    if (!spec || lines.length === 0) {
      return undefined;
    }
    let background = this.props.campaign.backgrounds[this.state.background];
    return new TextContainer(key, lines, {
      x: spec.x,
      y: spec.y,
      horizontalAlign: spec.horizontalAlignment,
      lineDistribution: spec.lineDistribution,
      bgFill: spec.includeBackgroundFill ? background.color : undefined,
      bgPadding: 10,
    });
  }

  private getRenderChildren(): Array<RenderElement> {
    let campaign = this.props.campaign;
    let language = campaign.languages[this.state.language].toLowerCase();
    let background = campaign.backgrounds[this.state.background].name.toLowerCase().replace(/ /g, '_');
    let size = campaign.sizes[this.state.size];

    let templateOptions = {
      language: language,
      background: background,
      size: size.name,
    };
    let children: Array<RenderElement> = [];
    {
      let pattern = campaign.assetPaths?.background || '{background}_{size}.png';
      children.push(new ImageElement("background", campaign.assetPath + "/" + format(pattern, templateOptions),
          {x: 0, y: 0, width: size.width, height: size.height}));
    }
    if (size.defaultPicture && this.state.use_default_pic) {
      let pattern = size.defaultPicture.assetPath || campaign.assetPaths?.defaultPicture || "{background}_defaultpicture_{language}.png";
      children.push(this.toImageElement("defaultPicture", size.defaultPicture, campaign.assetPath + "/" + format(pattern, templateOptions)));
    }
    if (size.picture && this.state.picture) {
      children.push(this.toImageElement("picture", size.picture, this.state.picture));
    }
    if (size.antiDefaultPicture && !this.state.use_default_pic) {
      let pattern = size.antiDefaultPicture.assetPath || campaign.assetPaths?.antiDefaultPicture || "{background}_antidefaultpicture_{language}.png";
      children.push(this.toImageElement("antiDefaultPicture", size.antiDefaultPicture, campaign.assetPath + "/" + format(pattern, templateOptions)));
    }
    if (size.header) {
      let pattern = size.header.assetPath || campaign.assetPaths?.header || "{background}_header_{language}.png";
      children.push(this.toImageElement("header", size.header, campaign.assetPath + "/" + format(pattern, templateOptions)));
    }
    if (size.logo && this.state.logo) {
      children.push(this.toImageElement("logo", size.logo, this.state.logo));
    }

    let websiteLines: Array<TextContainerLine> = [];
    if (!size.defaultPictureWebsiteDisabled || !this.state.use_default_pic) {
      if (this.state.website) {
        websiteLines.push({text: this.state.website, color: this.state.fontColor, fontSize: this.state.website_font_size, fontFamily: this.state.font});
      }
    }
    if (this.state.use_default_pic && size.defaultPictureWebsiteExtraText) {
      let fontSize = size.defaultPictureWebsiteExtraText.fontSize || this.state.website_font_size;
      let extraText = size.defaultPictureWebsiteExtraText.text[language];
      if (extraText) {
        websiteLines.push({text: extraText, color: this.state.fontColor, fontSize: fontSize, fontFamily: this.state.font});
      }
    }
    if (size.website && websiteLines.length > 0) {
      children.push(this.toTextElement("website", size.website, {fontSize: this.state.website_font_size}, websiteLines));
    }
    if (size.programInfo && this.state.program_info) {
      let lines: Array<TextContainerLine> = [];
      this.state.program_info.split("\n").forEach(line => {
        if (line) {
          lines.push({text: line, color: this.state.fontColor, fontSize: this.state.program_info_font_size, fontFamily: this.state.font});
        }
      });
      children.push(this.toTextElement("program_info", size.programInfo, {fontSize: this.state.program_info_font_size}, lines));
    }
    if (size.foreground) {
      let pattern = size.foreground.assetPath || campaign.assetPaths?.foreground || "{background}_foreground.png";
      children.push(this.toImageElement("foreground", size.foreground, campaign.assetPath + "/" + format(pattern, templateOptions)));
    }
    return children;
  }

  private renderToDom(): ReactNode {
    let size = this.props.campaign.sizes[this.state.size];
    return new ReactRenderer().render(size.width, size.height, this.getRenderChildren());
  }

  render() {
    let websiteInputDisabled = this.props.campaign.sizes[this.state.size].defaultPictureWebsiteDisabled && this.state.use_default_pic;

    return <Container>
      <Segment>
        <CropBox href={this.state.cropModalHref} onComplete={this.state.cropModalCallback} aspect={this.state.cropModalAspectRatio} />
        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form>
                <Form.Field>
                  <label>Background</label>
                  <Select options={this.props.campaign.backgrounds.map((bg, idx) => {return {value: idx, text: bg.name}})}
                          value={this.state.background}
                          onChange={(e, data) => this.setState({background: data.value as number})} />
                </Form.Field>
                <Form.Group widths="equal">
                  <Form.Field>
                    <label>Size</label>
                    <Select options={this.props.campaign.sizes.map((size, idx) => {return {value: idx, text: size.label}})}
                            value={this.state.size}
                            onChange={(e, data) => this.setState({size: data.value as number})} />
                  </Form.Field>
                  <Form.Field>
                    <label>Language</label>
                    <Select options={this.props.campaign.languages.map((language, idx) => {return {value: idx, text: language}})}
                            value={this.state.language}
                            onChange={(e, data) => this.setState({language: data.value as number})} />
                  </Form.Field>
                </Form.Group>
                {websiteInputDisabled ? null :
                  <Form.Group widths={16}>
                    <Form.Field width={12}>
                      <label>Website / Social Media</label>
                      <Input value={this.state.website} onChange={e => this.setState({website: e.target.value})} />
                    </Form.Field>
                    <Form.Field width={4}>
                      <label>Font Size</label>
                      <Input type="number" value={this.state.website_font_size} onChange={e => this.setState({website_font_size: parseInt(e.target.value)})} />
                    </Form.Field>
                  </Form.Group>
                }

                <Form.Group widths={16}>
                  <Form.Field width={12}>
                    <label>Program Information</label>
                    <TextArea rows={2} style={{resize: 'none'}} value={this.state.program_info} onChange={e => {
                      let val = e.target.value;
                      // Enforce maximum of two lines
                      if (val.split('\n').length > 2) {
                        return;
                      }
                      this.setState({program_info: val});
                    }} />
                  </Form.Field>
                  <Form.Field width={4}>
                    <label>Font Size</label>
                    <Input type="number" value={this.state.program_info_font_size} onChange={e => this.setState({program_info_font_size: parseInt(e.target.value)})} />
                  </Form.Field>
                </Form.Group>

                <Form.Group inline>
                  <label>Picture</label>
                  <Form.Field>
                    <Checkbox toggle label="Use default picture" checked={this.state.use_default_pic} onChange={(e, data) => {
                      this.setState({
                        use_default_pic: data.checked,
                        picture: data.checked ? undefined : this.state.picture,
                      });
                    }} />
                  </Form.Field>
                </Form.Group>

                {this.state.use_default_pic ? null : <Form.Field>
                  <ImageSelectFormField disabled={this.state.use_default_pic}
                                        value={this.state.picture} clear={() => this.setState({picture: undefined})}
                                        setImage={(files) => this.setImage('picture', files)} />
                  {this.props.campaign.suggestTransparentPictures ?
                      <p>We recommend using an image with a transparent background. Consider using <a href="https://www.adobe.com/express/feature/image/remove-background">this free tool</a> if you need to remove the background from an image.</p>
                      : null }
                </Form.Field>}

                <Form.Field>
                  <label>Logo</label>
                  <ImageSelectFormField value={this.state.logo}
                                        clear={() => this.setState({logo: undefined})}
                                        setImage={(files) => this.setImage('logo', files)} />
                </Form.Field>

                <Form.Group widths="equal">
                  <Form.Field>
                    <label>Font</label>
                    <Select options={FONTS.map(f => {return {key: f, label: <label style={{fontFamily: f}}>{f}</label>, value: f}})}
                            value={this.state.font} text={this.state.font}
                            onChange={(e, data) => this.setState({font: data.value as string})} />
                  </Form.Field>
                  <Form.Field>
                    <label>Font Color</label>
                    <ColorPicker
                      color={this.state.fontColor}
                      onChange={color => this.setState({fontColor: color })} />
                  </Form.Field>
                </Form.Group>

                <Button type="button" color="black" onClick={() => this.reset()}>Reset</Button>
                <Button type="button" primary icon labelPosition="left" onClick={() => this.downloadPng()}><Icon name="download" />Download (PNG)</Button>
                <Button type="button" color="green" icon labelPosition="left" onClick={() => this.downloadPdf()}><Icon name="file pdf" />Download (PDF)</Button>
              </Form>
            </Grid.Column>
            <Grid.Column width={8}>
              <Header as="h2">Preview</Header>
              {this.renderToDom()}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  }
}
