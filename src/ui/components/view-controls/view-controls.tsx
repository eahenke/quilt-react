import { Checkbox, Group } from '../ui';
import { useViewOptions, useViewOptionsActions, VIEW_TYPES } from '../../state/view-options';

const VIEW_CONTROLS = [
    {
        label: 'Color',
        value: VIEW_TYPES.COLORS,
    },
    {
        label: 'Numbers',
        value: VIEW_TYPES.NUMBERS,
    },
];

export const ViewControls = () => {
    const view = useViewOptions(state => state.view);
    const { setViewOption } = useViewOptionsActions();

    return (
        <Group>
            {VIEW_CONTROLS.map(({ label, value }) => {
                return (
                    <Checkbox
                        key={value}
                        label={label}
                        name={value}
                        checked={view[value]}
                        onChange={e => {
                            console.log('CHANGED', value, e.currentTarget.checked);
                            setViewOption(value, e.currentTarget.checked);
                        }}
                    />
                );
            })}
        </Group>
    );
};
