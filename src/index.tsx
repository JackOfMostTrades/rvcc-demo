import {render} from "react-dom";
import {Component, createElement} from "react";
import {TemplateCollection} from "./template_collection";
import {Container, Segment, Select} from "semantic-ui-react";

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
                    {text: "Gentle", value: 1},
                ]} value={this.state.template} onChange={(e, data) => this.setState({template: data.value as number})} />
            </Segment>
            <TemplateCollection templateIndex={this.state.template} />
        </Container>

    }
}

render(createElement(Demo), document.getElementById('demo'));
