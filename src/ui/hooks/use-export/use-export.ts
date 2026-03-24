import { Quilt } from '../../../engine';

const toCsv = (data: unknown[][]) => data.map(d => d.join(',')).join('\n');

export function useExportCsv() {
    const exportCsv = (quilt: Quilt) => {
        const csv = toCsv(quilt);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quilt.csv';
        a.click();
    };

    return {
        exportCsv,
    };
}
