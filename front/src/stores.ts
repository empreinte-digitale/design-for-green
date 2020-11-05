import {writable} from 'svelte/store';
import type {City, Aggregations, Results} from './types/app';

export const citySuggestionsStore = writable<City[]>(null);
export const aggregationsStore = writable<Aggregations>(null);
export const resultsStore = writable<Results>(null);
export const citySelectedStore = writable<City>(null);
