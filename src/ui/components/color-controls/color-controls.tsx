import { ColorInput, Text } from '../ui';
import { useViewOptions, useViewOptionsActions } from '../../state/view-options';
import { BACKGROUND, EMPTY } from '../../../engine';

export const ColorControls = () => {
    const colors = useViewOptions(state => state.colors);
    const { setColor } = useViewOptionsActions();
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
