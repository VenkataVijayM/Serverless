import { Flex } from "@chakra-ui/react";

const Visualization = () => {
  return (
    <Flex flexDirection={'column'} alignItems={'center'}>
      <iframe title="generalVisual" width="800" height="600" src="https://datastudio.google.com/embed/reporting/40128c5a-e8f8-4655-ae47-bb40b244d60c/page/dwY9C" frameborder="0"  allowfullscreen></iframe>
    </Flex> 
  );
};

export default Visualization;