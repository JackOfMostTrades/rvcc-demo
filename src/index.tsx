import {render} from "react-dom";
import {Component, createElement} from "react";
import {TemplateCollection} from "./template_collection";
import {Container, Segment, Select} from "semantic-ui-react";
import {FONTS} from "./fonts";

class Demo extends Component<{}, {template: number}> {
    constructor(props: {}) {
        super(props);
        this.state = {
            template: 0
        }
    }

    render() {
        return <Container>
            <Segment>
                <Select options={[
                    {text: "Boundaries", value: 0},
                    {text: "Deserve", value: 1},
                    {text: "Difference", value: 2},
                    {text: "Experience", value: 3},
                    {text: "Gentle", value: 4},
                    {text: "Pace", value: 5},
                    {text: "Progress", value: 6},
                    {text: "Resilient", value: 7},
                    {text: "Valid", value: 8},
                    {text: "Worthy", value: 9},
                    {text: "Boundaries (Square)", value: 10},
                    {text: "Boundaries (4x6)", value: 11},
                ]} value={this.state.template} onChange={(e, data) => this.setState({template: data.value as number})} />
            </Segment>
            <TemplateCollection templateIndex={this.state.template} />
        </Container>

    }
}

function preloadFonts() {
    // Trick to force preload of fonts
    let div = document.createElement('div');
    div.style.opacity = '0';
    div.style.height = '0';
    for (let font of FONTS) {
        let span = document.createElement('span');
        span.style.fontFamily = font;
        span.appendChild(document.createTextNode('x'));
        div.appendChild(span);
    }
    document.body.appendChild(div);
}

preloadFonts();
render(createElement(Demo), document.getElementById('demo'));
