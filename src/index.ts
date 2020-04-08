import '@flowervolution/frontend/styles/main.scss';
import { GameEngine } from '@flowervolution/core/engine';
const templateParameters: {
    [key: string]: any;
} = require('@flowervolution/frontend/config/template-parameters');

const engine: GameEngine = new GameEngine(templateParameters.gameMountId);
