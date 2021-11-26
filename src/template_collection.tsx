import {Component, ReactNode} from "react";
import {TemplateForm, TemplateState} from "./template_form";
import {ImageElement, TextElement} from "./renderer";

export interface Props {
    templateIndex: number
}

interface State {
}

interface CommonTemplateFormProps {
    thumbnail: string
    bg: string
    bgColor: string
}

class CommonTemplateForm extends Component<CommonTemplateFormProps, {}> {
    render() {
        return <TemplateForm
            width={1571}
            height={2000}
            backgroundThumbnail={this.props.thumbnail}
            backgroundFull={this.props.bg}
            renderChildren={[
                (state: TemplateState) => new ImageElement(state.pic, {x: 0, y: 318, width: 1571, height: 1435}),
                (state: TemplateState) => new ImageElement(state.logo, {x: 1271, y: 1453, width: 300, height: 300, bgFill: this.props.bgColor}),
                (state: TemplateState) => new TextElement(state.website, {x: 1571, y: 55, textAnchor: 'end', fontSize: 55, fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', bgFill: this.props.bgColor, bgPadding: 5}),
                (state: TemplateState) => new TextElement(state.program_info, {x: 785, y: 1950, textAnchor: 'middle', fontSize: 60, color: 'white', fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', verticalAlign: 'middle'})
            ]} />
    }
}

export class TemplateCollection extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        }
    }

    render() {
        let template: ReactNode;
        if (this.props.templateIndex === 0) {
            template = <CommonTemplateForm thumbnail='bg-thumbnail.jpg' bg='bg.png' bgColor='#ffbd59'/>
        } else if (this.props.templateIndex === 1) {
            template = <CommonTemplateForm thumbnail='bg2-thumbnail.jpg' bg='bg2.png' bgColor='#ccb4ae'/>
        }
        return template;
    }
}
