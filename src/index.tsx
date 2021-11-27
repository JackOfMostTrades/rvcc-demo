import {render} from "react-dom";
import {Component, createElement} from "react";
import {Container, Header} from "semantic-ui-react";
import {FONTS} from "./fonts";
import {TemplateForm} from "./template_form";
import {DEMO_CAMPAIGN} from "./model";

class Demo extends Component<{}, {template: number}> {
    constructor(props: {}) {
        super(props);
        this.state = {
            template: 0
        }
    }

    render() {
        return <Container>
            <Header as="h1">
                RVCC Demo
            </Header>
            <TemplateForm campaign={DEMO_CAMPAIGN} />
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
