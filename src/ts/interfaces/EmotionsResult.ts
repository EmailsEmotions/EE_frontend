import { Result } from './Result';

export interface EmotionsResult extends Result {
    angry: number;
    fear: number;
    happy: number;
    sad: number;
    surprise: number;
}