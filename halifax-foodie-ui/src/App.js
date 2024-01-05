import React from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';

import { CookiesProvider } from 'react-cookie';

import AppRoutes from './AppRoutes';

function App() {
  return (
    <ChakraProvider theme={theme}>
        <ColorModeSwitcher justifySelf="flex-end" />
      <CookiesProvider>
        <AppRoutes/>
      </CookiesProvider>
    </ChakraProvider>
  );
}

export default App;
