import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

import './App.css';
import { Generate } from './ui/components/generate/generate';

function App() {
    return (
        <MantineProvider defaultColorScheme="dark">
            <Generate />
        </MantineProvider>
    );
}

export default App;
