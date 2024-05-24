import { useState } from 'react';
import { Grid } from '../ui';

import { QuiltDisplay } from '../quilt/quilt';
import { Controls } from '../controls/controls';
import { Inputs, Quilt } from '../../../engine';
import { useGenerateQuilt } from '../../hooks/use-generate-quilt';
import { useExportCsv } from '../../hooks/use-export';

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
    const { exportCsv } = useExportCsv();

    const handleGenerate = async () => {
        const q = await generateQuilt(inputs);
        setQuilt(q);
    };

    const handleExport = () => {
        if (!quilt) return;
        exportCsv(quilt);
    };

    return (
        <Grid gutter={'sm'}>
            <Grid.Col span={2}>
                <Controls exportCsv={handleExport} generate={handleGenerate} onChange={setInputs} values={inputs} />
            </Grid.Col>
            <Grid.Col span={8}>
                {loading ? <p>Generating. This may take a few moments...</p> : null}
                {!loading && error ? <p>{error}</p> : null}
                {!loading && !error ? (
                    <QuiltDisplay cols={inputs.cols} pattern={inputs.patternName} quilt={quilt} rows={inputs.rows} />
                ) : null}
            </Grid.Col>
            <Grid.Col span={2} />
        </Grid>
    );
}
