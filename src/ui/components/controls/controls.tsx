import { Inputs, PATTERNS } from '../../../engine';

const patternOptions = Object.keys(PATTERNS);

export type ControlsProps = {
    onChange: (vals: Inputs) => void;
    values: Inputs;
    generate: () => void;
    save: () => void;
};

export const Controls = ({ values, onChange, generate, save }: ControlsProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.currentTarget.value;
        const key = e.currentTarget.name;
        const newVals = {
            ...values,
            [key]: val
        };
        onChange(newVals);
    };

    const handleNumChange = (e: React.FormEvent<HTMLInputElement>) => {
        const val = parseInt(e.currentTarget.value, 10);
        const key = e.currentTarget.name;
        const newVals = {
            ...values,
            [key]: val
        };
        onChange(newVals);
    };

    return (
        <div className="controls-row">
            <div className="control">
                <label htmlFor="patterName">Pattern</label>
                {/* eslint-disable-next-line jsx-a11y/no-onchange */}
                <select id="patternName" name="patternName" onChange={handleChange}>
                    {patternOptions.map(pattern => (
                        <option key={pattern} value={pattern}>
                            {pattern}
                        </option>
                    ))}
                </select>
            </div>
            <div className="control">
                <label htmlFor="fabrics">Fabrics</label>
                <input id="fabrics" name="fabrics" onChange={handleNumChange} type="number" value={values.fabrics} />
            </div>
            <div className="control">
                <label htmlFor="rows">Rows</label>
                <input id="rows" name="rows" onChange={handleNumChange} type="number" value={values.rows} />
            </div>
            <div className="control">
                <label htmlFor="cols">Columns</label>
                <input id="cols" name="cols" onChange={handleNumChange} type="number" value={values.cols} />
            </div>
            <button onClick={generate} type="button">
                Generate
            </button>
            <button onClick={save} type="button">
                Save
            </button>
        </div>
    );
};
