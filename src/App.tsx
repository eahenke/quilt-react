import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

import './App.css';
import { Generate } from './ui/components/generate/generate';

function App() {
    return (
        <MantineProvider>
            <Generate />
        </MantineProvider>
    );
}

export default App;
