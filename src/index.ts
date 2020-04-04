import '@flowervolution/templates/style.scss';
import { SVGHandler } from '@flowervolution/svg-handler';
const templateParameters: {
    [key: string]: any;
} = require('@flowervolution/templates/template-parameters');

declare global {
    interface Window {
        svgHandler: SVGHandler;
    }
}

window.svgHandler = new SVGHandler(templateParameters.gameMountId);

for (let i: number = 0; i < 8; i += 1) {
    for (let j: number = 0; j < 8; j += 1) {
        const rectSize: number = 50;
        window.svgHandler.addRectChild(
            { x: i * rectSize, y: j * rectSize },
            { x: rectSize, y: rectSize },
            null,
            { class: 'grid-cell' },
        );
    }
}

console.log(window.svgHandler);
