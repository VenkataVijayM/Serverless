// Description - This file responsible for displaying list of similar recipes passed from SimilarRecipes.jsx

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  UnorderedList,
  ListItem,
  Heading,
} from '@chakra-ui/react';

const SimilarRecipeModal = ({ similarRecipes, isOpen, onClose }) => {

  //the content of modal i.e. list of simialr recipes will be displayed using this
    const modalBodyContent = () => {
        if(similarRecipes.length>0) {
            return <UnorderedList>
            {
                similarRecipes.map((recipe,index)=>(
                    <ListItem key = {index} >{recipe} </ListItem>
                )) 
            }
        </UnorderedList>

        } else {
            return <Heading>No Similar Recipes</Heading>
        }
    }

  return (
    <Modal
      size={'xl'}
      isCentered
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent>
        <ModalHeader>Similar Recipes</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
            {modalBodyContent()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SimilarRecipeModal;


