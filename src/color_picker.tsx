import {Component, ReactNode} from "react";
import {SketchPicker} from "react-color";
import {Input, Label} from "semantic-ui-react";

export interface Props {
    color: string
    onChange: (color: string) => void
}

interface State {
    open?: boolean
}

export default class ColorPicker extends Component<Props, State> {
    private node: Node|undefined;

    constructor(props: Props) {
        super(props);
        this.state = {
            open: false,
        }
        this.handlePageClick = this.handlePageClick.bind(this);
    }

    // set up a listener for page clicks
    componentWillMount(){
        document.addEventListener('mousedown', this.handlePageClick, false)
    }

    componentWillUnmount(){
        document.removeEventListener('mousedown', this.handlePageClick, false)
    }

    private handlePageClick(e: MouseEvent) {
        if(this.node && e.target && this.node.contains(e.target as Node)){
            return
        }
        this.setState({
            open: false,
        });
    }

    render() {
        let popup: ReactNode = null;
        if (this.state.open) {
            popup = <div ref={node => this.node = node}
                         style={{position: 'absolute', top: 5, left: 5, zIndex: 1 }}>
                <SketchPicker color={this.props.color} onChange={color => this.props.onChange(color.hex)} />
            </div>;
        }

        return <div style={{position: 'relative'}}
                    onClick={() => this.setState({open: true})}>
            <Input icon
                   iconPosition='left'
                   value={this.props.color}>
                <i className="icon" style={{opacity: 1, padding: '0.5em'}}><div style={{width: "100%", height: "100%", borderRadius: '2px', background: this.props.color}} /></i>
                <input />
            </Input>
            {popup}
        </div>
    }
}
