import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Colors, ValueOf } from '../types';
import { BACKGROUND, EMPTY } from '../../engine';

export const VIEW_TYPES = {
    COLORS: 'colors',
    NUMBERS: 'numbers',
} as const;

type ViewOptions = {
    colors: boolean;
    numbers: boolean;
};
type ViewOption = keyof ViewOptions;

export type ViewType = ValueOf<typeof VIEW_TYPES>;

type ViewOptionsState = {
    colors: Colors;
    view: ViewOptions;
    actions: {
        setColor: (key: string, color: string) => void;
        setViewOption: (key: ViewOption, val: boolean) => void;
    };
};

// TODO: fix usage of numbers or strings
const DEFAULT_COLORS = {
    [BACKGROUND]: 'DarkGray',
    [EMPTY]: 'white',
    '1': '#145DA0',
    '2': '#0C2D48',
    '3': '#2E8BC0',
    '4': '#B1D4E0',
    '5': '#41729F',
    '6': '#5885AF',
    '7': '#274472',
    '8': '#C3E0E5',
    '9': '#BFD7ED',
    '10': '#60A3D9',
};

export const useViewOptions = create<ViewOptionsState>()(
    persist(
        (set, get) => ({
            colors: DEFAULT_COLORS,
            view: {
                colors: true,
                numbers: false,
            },
            actions: {
                setColor: (key: string, color: string) =>
                    set({
                        colors: {
                            ...get().colors,
                            [key]: color,
                        },
                    }),
                setViewOption: (key: 'colors' | 'numbers', val: boolean) =>
                    set(state => ({
                        ...state,
                        view: {
                            ...state.view,
                            [key]: val,
                        },
                    })),
            },
        }),
        {
            name: 'view-options',
            partialize: state =>
                Object.fromEntries(Object.entries(state).filter(([key]) => key !== 'actions')),
        }
    )
);

export const useViewOptionsActions = () => useViewOptions(state => state.actions);
