import { Inputs, Pattern, PATTERNS } from '../../../engine';
import { Select, TextInput, Flex, Button } from '../ui';

const patternOptions = Object.keys(PATTERNS);

export type ControlsProps = {
    onChange: (vals: Inputs) => void;
    values: Inputs;
    generate: () => void;
    exportCsv: () => void;
};

export const Controls = ({ generate, onChange, values, exportCsv }: ControlsProps) => {
    const handleChange = (val: string | null) => {
        const newVals = {
            ...values,
            patternName: (val || 'harken') as Pattern,
        };
        onChange(newVals);
    };

    const handleNumChange = (e: React.FormEvent<HTMLInputElement>) => {
        const val = parseInt(e.currentTarget.value, 10);
        const key = e.currentTarget.name;
        const newVals = {
            ...values,
            [key]: val,
        };
        onChange(newVals);
    };

    return (
        <Flex direction="column" gap="md" justify="flex-start" mih={50} wrap="wrap">
            <div className="control">
                <Select
                    data={patternOptions}
                    label="Pattern"
                    name="patternName"
                    onChange={handleChange}
                    value={values.patternName}
                />
            </div>
            <div className="control">
                <TextInput
                    label="Fabrics"
                    min={1}
                    name="fabrics"
                    onChange={handleNumChange}
                    type="number"
                    value={values.fabrics}
                />
            </div>
            <div className="control">
                <TextInput
                    label="Rows"
                    min={1}
                    name="rows"
                    onChange={handleNumChange}
                    type="number"
                    value={values.rows}
                />
            </div>
            <div className="control">
                <TextInput
                    label="Columns"
                    min={1}
                    name="cols"
                    onChange={handleNumChange}
                    type="number"
                    value={values.cols}
                />
            </div>
            <Button onClick={generate} variant="filled">
                Generate
            </Button>
            <Button onClick={exportCsv} variant="outline">
                Export
            </Button>
        </Flex>
    );
};
