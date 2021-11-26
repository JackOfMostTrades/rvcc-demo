import {Component, ReactNode} from 'react';
import {Button, Container, Form, Grid, Header, Icon, Image, Input, Segment, Select, TextArea} from "semantic-ui-react";
import {CanvasRenderer, ImageElement, PdfRenderer, ReactRenderer, RenderElement} from "./renderer";
import {CropBox} from "./cropbox";
import {FONTS} from "./fonts";

export interface TemplateState {
  website?: string
  program_info?: string
  logo?: string
  pic?: string
  font?: string
  fontSize?: number
}

export interface Props {
  width: number
  height: number
  backgroundThumbnail: string
  backgroundFull: string
  renderChildren: Array<(state: TemplateState) => RenderElement>
}

interface State {
  website?: string
  program_info?: string
  logo?: string
  pic?: string
  font?: string
  fontSize?: number

  cropModalHref?: string
  cropModalCallback?: (dataUrl: string) => void
}

class ImageSelectFormField extends Component<{value?: string, clear: () => void, setImage: (files: FileList) => void}, {}> {
  render() {
    if (this.props.value) {
      return <Segment clearing>
        <Image src={this.props.value} size="tiny" floated="left"/>
        <Button color="red" floated="right" icon labelPosition="left" onClick={() => this.props.clear()}>
          <Icon name="x"/>Clear
        </Button>
      </Segment>;
    }
    return <Input type="file" onChange={e => this.props.setImage(e.target.files)} />;
  }
}

export class TemplateForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      website: "",
      program_info: "",
      font: 'Quicksand',
      fontSize: 55,
    };
    this.setImage = this.setImage.bind(this);
  }

  private reset() {
    this.setState({
      website: "",
      program_info: "",
      logo: undefined,
      pic: undefined,
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
    let canvasPromise = new CanvasRenderer().render(this.props.width, this.props.height, this.getRenderChildren(false));
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
    let docPromise = new PdfRenderer().render(this.props.width, this.props.height, this.getRenderChildren(false));
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

  private getRenderChildren(forPreview: boolean): Array<RenderElement> {
    let children: Array<RenderElement> = [
        new ImageElement(forPreview ? this.props.backgroundThumbnail : this.props.backgroundFull,
            {x: 0, y: 0, width: this.props.width, height: this.props.height}),
    ];
    for (let i = 0; i < this.props.renderChildren.length; i++) {
      children.push(this.props.renderChildren[i](this.state));
    }
    return children;
  }

  private renderToDom(): ReactNode {
    return new ReactRenderer().render(this.props.width, this.props.height, this.getRenderChildren(true));
  }

  render() {
    return <Container>
      <Header as="h1">
        RVCC Demo
      </Header>
      <Segment>
        <CropBox href={this.state.cropModalHref} onComplete={this.state.cropModalCallback} />
        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form>
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
                <Form.Field>
                  <label>Picture</label>
                  <ImageSelectFormField value={this.state.pic} clear={() => this.setState({pic: undefined})} setImage={(files) => this.setImage('pic', files)} />
                </Form.Field>
                <Form.Field>
                  <label>Font</label>
                  <Select options={FONTS.map(f => {return {key: f, text: f, value: f}})}
                          value={this.state.font} onChange={(e, data) => this.setState({font: data.value as string})} />
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
