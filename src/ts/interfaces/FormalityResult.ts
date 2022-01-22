import { Result } from './Result';

export interface FormalityResult extends Result {
    formality: number;
    informality: number;
}