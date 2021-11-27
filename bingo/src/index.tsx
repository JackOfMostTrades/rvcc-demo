import {render} from "react-dom";
import {Component, createElement, Fragment} from "react";
import {Container, Grid, Header, Image, Segment} from "semantic-ui-react";
import update from 'immutability-helper';

const CARD_COUNT = 54;
const BOARD_ROWS = 4;
const BOARD_COLS = 4;
const BOARD_SIZE = BOARD_ROWS * BOARD_COLS;

function shuffleArray(arr: Array<unknown>) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

interface Props {
}

interface State {
    board?: number[];
    marks?: boolean[];
}

class Demo extends Component<Props, State> {
    constructor(props: {}) {
        super(props);

        let cards = [];
        for (let i = 0; i < CARD_COUNT; i++) {
            cards.push(i);
        }
        shuffleArray(cards);

        let board = [];
        let marks = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            board[i] = cards[i];
            marks[i] = false;
        }
        this.state = {
            board: board,
            marks: marks,
        };
    }

    private setMark(row: number, col: number, marked: boolean) {
        let n = row * BOARD_COLS + col;
        this.setState({
            marks: update(this.state.marks, {[n]: {$set: marked}}),
        });
    }

    private toggleMark(row: number, col: number) {
        let n = row * BOARD_COLS + col;
        this.setState({
            marks: update(this.state.marks, {[n]: {$set: !this.state.marks[n]}}),
        });
    }

    render() {
        let rows = [];
        for (let i = 0; i < BOARD_ROWS; i++) {
            let cols = [];
            for (let j = 0; j < BOARD_COLS; j++) {
                let cell = <Grid.Column key={j} width={4}>
                    <div style={{position: "relative", cursor: "pointer", margin: "1em"}}
                         onClick={() => this.toggleMark(i, j)} >
                        <Image style={{maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto"}}
                             src={"images/" + (this.state.board[i*BOARD_COLS+j]+1) + ".png"} />
                        {this.state.marks[i*BOARD_COLS+j] ?
                            <Fragment>
                                <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "white", opacity: "0.8"}} />
                                <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}>
                                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                                        <line x1="10" y1="10" x2="90" y2="90" strokeLinecap="round" style={{stroke: "red", strokeWidth: 10}} />
                                        <line x1="90" y1="10" x2="10" y2="90" strokeLinecap="round" style={{stroke: "red", strokeWidth: 10}} />
                                    </svg>
                                </div>
                            </Fragment>
                            : null}
                    </div>
                </Grid.Column>;
                cols.push(cell);
            }
            rows.push(<Grid.Row key={i} children={cols} />);
        }

        return <Container>
            <Header as="h2">
                Bingo Demo
            </Header>
            <Segment>
                <Grid children={rows} />
            </Segment>
        </Container>
    }
}

render(createElement(Demo), document.getElementById('demo'));
