import '@flowervolution/templates/style.scss';
import { SVGHandler } from '@flowervolution/svg-handler';
const templateParameters: {[key: string]: any} = require('@flowervolution/templates/template-parameters');

console.log(new SVGHandler(templateParameters.gameMountId));
