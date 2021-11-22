import {render} from "react-dom";
import {createElement} from "react";
import {TemplateForm, TemplateState} from "./template_form";
import {ImageElement, TextElement} from "./renderer";

render(createElement(TemplateForm, {
    width: 1571,
    height: 2000,
    backgroundThumbnail: 'bg-thumbnail.jpg',
    backgroundFull: 'bg.png',
    renderChildren: [
        (state: TemplateState) => new ImageElement(state.logo, {x: 1271, y: 1453, width: 300, height: 300, bgFill: '#ffbd59'}),
        (state: TemplateState) => new ImageElement(state.pic, {x: 0, y: 318, width: 1571, height: 1435}),
        (state: TemplateState) => new TextElement(state.website, {x: 1571, y: 75, textAnchor: 'end', fontSize: 75, fontWeight: 'bold', fontFamily: 'Quicksand, sans-serify', bgFill: '#ffbd59', bgPadding: 5}),
        (state: TemplateState) => new TextElement(state.program_info, {x: 785, y: 1970, textAnchor: 'middle', fontSize: 90, color: 'white', fontWeight: 'bold', fontFamily: 'Quicksand, sans-serify'})
    ],
}), document.getElementById('demo'));
