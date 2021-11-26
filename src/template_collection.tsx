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
                (state: TemplateState) => new ImageElement(state.pic, {x: 0, y: 590, width: 1571, height: 1235}),
                (state: TemplateState) => new ImageElement(state.logo, {x: 1396, y: 1825, width: 175, height: 175, horizontalAlign: 'right'}),
                (state: TemplateState) => new TextElement(state.website, {x: 1571, y: state.fontSize || 55, textAnchor: 'end', fontSize: state.fontSize || 55, fontWeight: 'bold', fontFamily: (state.font || 'Quicksand') + ', sans-serif', bgFill: this.props.bgColor, bgPadding: 5}),
                (state: TemplateState) => new TextElement(state.program_info, {x: (state.logo ? 698 : 785), y: 1902 + (state.fontSize || 55)/2, textAnchor: 'middle', fontSize: state.fontSize || 55, color: 'black', fontWeight: 'bold', fontFamily: (state.font || 'Quicksand') + ', sans-serif', verticalAlign: 'middle'})
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
        switch (this.props.templateIndex) {
            case 0:
                return <CommonTemplateForm thumbnail='images/boundaries.png' bg='images/boundaries.png' bgColor='#ffbd59'/>
            case 1:
                return <CommonTemplateForm thumbnail='images/deserve.png' bg='images/deserve.png' bgColor='#f36e80'/>
            case 2:
                return <CommonTemplateForm thumbnail='images/difference.png' bg='images/difference.png' bgColor='#4ea23e'/>
            case 3:
                return <CommonTemplateForm thumbnail='images/experience.png' bg='images/experience.png' bgColor='#9d7bd9'/>
            case 4:
                return <CommonTemplateForm thumbnail='images/gentle.png' bg='images/gentle.png' bgColor='#ccb4ae'/>
            case 5:
                return <CommonTemplateForm thumbnail='images/pace.png' bg='images/pace.png' bgColor='#64cca3'/>
            case 6:
                return <CommonTemplateForm thumbnail='images/progress.png' bg='images/progress.png' bgColor='#f7e367'/>
            case 7:
                return <CommonTemplateForm thumbnail='images/resilient.png' bg='images/resilient.png' bgColor='#b1a1fa'/>
            case 8:
                return <CommonTemplateForm thumbnail='images/valid.png' bg='images/valid.png' bgColor='#7acbef'/>
            case 9:
                return <CommonTemplateForm thumbnail='images/worthy.png' bg='images/worthy.png' bgColor='#f09333'/>
        }
        return null;
    }
}
