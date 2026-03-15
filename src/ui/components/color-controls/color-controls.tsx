import { ColorInput, SegmentedControl, Text } from '../ui';
import { VIEW_TYPES, ViewType, useViewOptions, useViewOptionsActions } from '../../state/view-options';
import { BACKGROUND, EMPTY } from '../../../engine';

export const ColorControls = () => {
    const colors = useViewOptions(state => state.colors);
    const viewType = useViewOptions(state => state.viewType);
    const { setColor, setViewType } = useViewOptionsActions();
    const handleChange = (key: string, color: string) => {
        setColor(key, color);
    };

    const dynamicColors = Object.entries(colors).filter(
        ([key]) => key.toString() !== EMPTY.toString() && key !== BACKGROUND.toString()
    );

    return (
        <div>
            <Text fw={500} mt={3} size="sm">
                View
            </Text>
            <SegmentedControl
                data={[
                    {
                        label: 'Colors',
                        value: VIEW_TYPES.COLOR
                    },
                    {
                        label: 'Numbers',
                        value: VIEW_TYPES.NUMBER
                    }
                ]}
                onChange={value => {
                    setViewType(value as ViewType);
                }}
                value={viewType}
            />
            <ColorInput
                label="Background"
                onChangeEnd={color => handleChange(BACKGROUND.toString(), color)}
                value={colors[BACKGROUND]}
            />
            {dynamicColors.map(([key, value], idx) => (
                <ColorInput
                    key={key}
                    label={`Fabric ${idx + 1}`}
                    onChangeEnd={color => handleChange(key, color)}
                    value={value}
                />
            ))}
        </div>
    );
};
