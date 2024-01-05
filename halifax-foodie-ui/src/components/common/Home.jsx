import { Outlet } from "react-router-dom";
import { Box, Flex } from '@chakra-ui/react';
import GlobalNav from "./GlobalNav";

const Home = () => {
  return (
    <Flex direction={'column'}>
      <GlobalNav />

      <Box mt={4}>
        <Outlet />
      </Box>
    </Flex>
  )
};

export default Home;