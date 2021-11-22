import {Component, ReactNode} from 'react';
import {Button, Container, Form, Grid, Header, Icon, Input, Segment} from "semantic-ui-react";
import {CanvasRenderer, ImageElement, ReactRenderer, RenderElement, TextElement} from "./renderer";
import {CropBox} from "./cropbox";

export interface TemplateState {
  website?: string
  program_info?: string
  logo?: string
  pic?: string
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

  cropModalHref?: string
  cropModalCallback?: (dataUrl: string) => void
}

export class TemplateForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      website: "",
      program_info: "",
    };
  }

  private reset() {
    this.setState({
      website: "",
      program_info: "",
      logo: undefined,
      pic: undefined,
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
                  <Input value={this.state.program_info} onChange={e => this.setState({program_info: e.target.value})} />
                </Form.Field>
                <Form.Field>
                  <label>Logo</label>
                  <Input type="file" onChange={e => this.setImage('logo', e.target.files)} />
                </Form.Field>
                <Form.Field>
                  <label>Picture</label>
                  <Input type="file" onChange={e => this.setImage('pic', e.target.files)} />
                </Form.Field>
                <Button color="black" onClick={() => this.reset()}>Reset</Button>
                <Button primary icon labelPosition="left" onClick={() => this.downloadPng()}><Icon name="download" />Download (PNG)</Button>
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
