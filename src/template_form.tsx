import {Component, ReactNode} from 'react';
import {
  Button,
  Checkbox,
  Container,
  Dimmer,
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
import {CanvasRenderer, ImageElement, PdfRenderer, ReactRenderer, RenderElement, TextElement} from "./renderer";
import {CropBox} from "./cropbox";
import {FONTS} from "./fonts";
import {Campaign, ImageSpec, TextSpec} from "./model";

export interface Props {
  campaign: Campaign
}

interface State {
  background?: number
  size?: number
  language?: number
  website?: string
  program_info?: string
  logo?: string
  use_default_pic?: boolean
  pic?: string
  font?: string
  fontSize?: number

  cropModalHref?: string
  cropModalCallback?: (dataUrl: string) => void
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
      program_info: "",
      use_default_pic: true,
      font: 'Quicksand',
      fontSize: 55,
    };
    this.setImage = this.setImage.bind(this);
  }

  private reset() {
    this.setState({
      background: 0,
      size: 0,
      language: 0,
      website: "",
      program_info: "",
      logo: undefined,
      pic: undefined,
      use_default_pic: true,
      font: 'Quicksand',
      fontSize: 55,
      cropModalHref: undefined,
      cropModalCallback: undefined,
    });
  }

  private setImage(fieldName: 'logo' | 'pic', files: FileList) {
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
    let reader = new FileReader();
    reader.addEventListener('load', function (e) {
      self.setState({
        cropModalHref: e.target.result as string,
        cropModalCallback: (dataUrl) => {
          self.setState({cropModalHref: undefined, cropModalCallback: undefined, [fieldName]: dataUrl});
        }
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
      bgFill: spec.includeBackgroundFill ? background.color : undefined,
      bgPadding: 0,
    });
  }

  private toTextElement(key: string, spec: TextSpec|undefined, text: string|undefined): TextElement|undefined {
    if (!spec || !text) {
      return undefined;
    }
    let background = this.props.campaign.backgrounds[this.state.background];
    return new TextElement(key, text, {
      x: spec.x,
      y: spec.y,
      fontSize: this.state.fontSize,
      color: 'black',
      fontFamily: this.state.font + ', sans-serif',
      horizontalAlign: spec.horizontalAlignment,
      verticalAlign: spec.verticalAlignment,
      lineDistribution: spec.lineDistribution,
      bgFill: spec.includeBackgroundFill ? background.color : undefined,
      bgPadding: 5,
    });
  }

  private getRenderChildren(): Array<RenderElement> {
    let campaign = this.props.campaign;
    let language = campaign.languages[this.state.language];
    let background = campaign.backgrounds[this.state.background];
    let size = campaign.sizes[this.state.size];
    let children: Array<RenderElement> = [
        new ImageElement("background", `${campaign.assetPath}/${background.name.toLowerCase()}_${size.name}.png`,
            {x: 0, y: 0, width: size.width, height: size.height}),
    ];
    if (size.header) {
      children.push(this.toImageElement("header", size.header, `${campaign.assetPath}/header_${language.toLowerCase()}.png`));
    }
    if (size.defaultPicture && this.state.use_default_pic) {
      children.push(this.toImageElement("defaultPicture", size.defaultPicture, `${campaign.assetPath}/${background.name.toLowerCase()}_defaultpicture_${language.toLowerCase()}.png`));
    }
    if (size.antiDefaultPicture && !this.state.use_default_pic) {
      children.push(this.toImageElement("antiDefaultPicture", size.antiDefaultPicture, `${campaign.assetPath}/${background.name.toLowerCase()}_antidefaultpicture_${language.toLowerCase()}.png`));
    }
    if (size.picture && this.state.pic) {
      children.push(this.toImageElement("picture", size.picture, this.state.pic));
    }
    if (size.logo && this.state.logo) {
      children.push(this.toImageElement("logo", size.logo, this.state.logo));
    }
    if (size.website && this.state.website) {
      children.push(this.toTextElement("website", size.website, this.state.website));
    }
    if (size.programInfo && this.state.program_info) {
      children.push(this.toTextElement("program_info", size.programInfo, this.state.program_info));
    }
    return children;
  }

  private renderToDom(): ReactNode {
    let size = this.props.campaign.sizes[this.state.size];
    return new ReactRenderer().render(size.width, size.height, this.getRenderChildren());
  }

  render() {
    return <Container>
      <Segment>
        <CropBox href={this.state.cropModalHref} onComplete={this.state.cropModalCallback} />
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
                <Form.Field>
                  <label>Website / Social Media</label>
                  <Input value={this.state.website} onChange={e => this.setState({website: e.target.value})} />
                </Form.Field>
                <Form.Field>
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
                <Form.Field>
                  <label>Logo</label>
                  <ImageSelectFormField value={this.state.logo} clear={() => this.setState({logo: undefined})} setImage={(files) => this.setImage('logo', files)} />
                </Form.Field>

                <Form.Group inline>
                  <label>Picture</label>
                  <Form.Field>
                    <Checkbox toggle label="Use default picture" checked={this.state.use_default_pic} onChange={(e, data) => {
                      this.setState({
                        use_default_pic: data.checked,
                        pic: data.checked ? undefined : this.state.pic,
                      });
                    }} />
                  </Form.Field>
                </Form.Group>
                <Form.Field>
                  <Dimmer.Dimmable as={Segment} dimmed={this.state.use_default_pic}>
                    <Dimmer inverted active={this.state.use_default_pic} />
                    <ImageSelectFormField disabled={this.state.use_default_pic} value={this.state.pic} clear={() => this.setState({pic: undefined})} setImage={(files) => this.setImage('pic', files)} />
                    <p>We recommend using an image with a transparent background. Consider using <a href="https://www.adobe.com/express/feature/image/remove-background">this free tool</a> if you need to remove the background from an image.</p>
                  </Dimmer.Dimmable>
                </Form.Field>

                <Form.Field>
                  <label>Font</label>
                  <Select options={FONTS.map(f => {return {key: f, label: <label style={{fontFamily: f}}>{f}</label>, value: f}})}
                          value={this.state.font} text={this.state.font}
                          onChange={(e, data) => this.setState({font: data.value as string})} />
                </Form.Field>
                <Form.Field>
                  <label>Font Size</label>
                  <Input type="number" value={this.state.fontSize} onChange={e => this.setState({fontSize: parseInt(e.target.value)})} />
                </Form.Field>

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
