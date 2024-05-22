import { useState } from 'react';
import { QuiltDisplay } from '../quilt/quilt';
import { Controls } from '../controls/controls';
import { Inputs, Quilt } from '../../../engine';
import { useGenerateQuilt } from '../../hooks/use-generate-quilt';

const DEFAULT_INPUTS: Inputs = {
    patternName: 'harken',
    rows: 6,
    cols: 5,
    fabrics: 10
};

export function Generate() {
    const [quilt, setQuilt] = useState<Quilt | null>(null);
    const [inputs, setInputs] = useState(DEFAULT_INPUTS);
    const { generateQuilt, loading, error } = useGenerateQuilt();

    const save = () => {
        // TODO: implement localStorage
        console.log('Saving...');
    };

    const handleGenerate = async () => {
        const q = await generateQuilt(inputs);
        setQuilt(q);
    };

    return (
        <div>
            <Controls
                generate={() => {
                    handleGenerate();
                }}
                onChange={vals => setInputs(vals)}
                save={save}
                values={inputs}
            />
            {loading ? <p>Generating. This may take a few moments...</p> : null}
            {!loading && error ? <p>{error}</p> : null}
            {quilt ? <QuiltDisplay pattern={'harken'} quilt={quilt} /> : null}
        </div>
    );
}
