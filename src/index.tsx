import {Component, createElement, ReactNode} from 'react';
import {render} from "react-dom";
import {Button, Container, Form, Grid, Header, Icon, Input, Segment} from "semantic-ui-react";
import {CanvasRenderer, ImageElement, ReactRenderer, RenderElement, TextElement} from "./renderer";
import {CropBox} from "./cropbox";

interface Props {
}

interface State {
  website?: string
  program_info?: string
  logo?: string
  pic?: string

  cropModalHref?: string
  cropModalCallback?: (dataUrl: string) => void
}

class Demo extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      website: "",
      program_info: "",
    };
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
    let canvasPromise = new CanvasRenderer().render(this.getRenderChildren());
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

  private getRenderChildren(): Array<RenderElement> {
    return [
      new ImageElement("bg-thumbnail.jpg", {x: 0, y: 0, width: 1571, height: 2000}),
      new ImageElement(this.state.logo, {x: 1271, y: 1453, width: 300, height: 300, bgFill: '#ffbd59'}),
      new ImageElement(this.state.pic, {x: 0, y: 318, width: 1571, height: 1435}),
      new TextElement(this.state.website, {x: 1571, y: 75, textAnchor: 'end', fontSize: 75, fontWeight: 'bold', fontFamily: 'Quicksand, sans-serify', bgFill: '#ffbd59', bgPadding: 5}),
      new TextElement(this.state.program_info, {x: 785, y: 1970, textAnchor: 'middle', fontSize: 90, color: 'white', fontWeight: 'bold', fontFamily: 'Quicksand, sans-serify'})
    ];
  }

  private renderToDom(): ReactNode {
    return new ReactRenderer().render(this.getRenderChildren());
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

render(createElement(Demo), document.getElementById('demo'));
