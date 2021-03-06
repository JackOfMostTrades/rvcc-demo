import {render} from "react-dom";
import {Component, createElement} from "react";
import {Container, Header} from "semantic-ui-react";
import {FONTS} from "./fonts";
import {TemplateForm} from "./template_form";
import {SURVIVOR_CAMPAIGN} from "./survivor_campaign";
import {Campaign} from "./model";
import {HEALTHY_CAMPAIGN} from "./healthy_campaign";

class Demo extends Component<{campaign: Campaign}, {}> {
    constructor(props: {campaign: Campaign}) {
        super(props);
    }

    render() {
        return <Container>
            <Header as="h1">
                RVCC Demo
            </Header>
            <TemplateForm campaign={this.props.campaign} />
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
let campaign: Campaign;
let campaignName: string = new URLSearchParams(window.location.search).get('campaign') || 'demo';
switch (campaignName) {
    case 'demo':
        campaign = SURVIVOR_CAMPAIGN;
        break;
    case 'healthy':
        campaign = HEALTHY_CAMPAIGN;
        break;
    default:
        campaign = SURVIVOR_CAMPAIGN;
        break;
}

var loader = setInterval(() => {
    if (document.readyState !== 'complete') {
        return;
    }
    clearInterval(loader);
    render(createElement(Demo, {campaign: campaign}), document.getElementById('demo'));
});
