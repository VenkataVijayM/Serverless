import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
} from '@chakra-ui/react';

const validationSchema = Yup.object({
  name: Yup.string().required('Recipe name is required.'),
  price: Yup.number().required('Price is required.').moreThan(0, "Price should be more than 0."),
});

const SuccessModal = ({ isOpen, onClose, onAddRecipe }) => {
  const formik = useFormik({
    initialValues: {
      name: '',
      price: ''
    },
    onSubmit: async (values, actions) => {
      actions.setSubmitting(true);

      await onAddRecipe(values.name, values.price);

      actions.setSubmitting(false);
      handleClose();
    },
    validationSchema,
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  }

  return (
    <Modal
      size={'md'}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent>
        <ModalHeader>Add Recipe</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={'4'} alignItems={'flex-start'}>
            <Box>
              <FormControl
                id="name"
                isRequired
                isInvalid={formik.touched.name && formik.errors.name}
              >
                <FormLabel>Recipe name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  {...formik.getFieldProps('name')}
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>
            </Box>
            <Box>
              <FormControl
                id="price"
                isRequired
                isInvalid={formik.touched.price && formik.errors.price}
              >
                <FormLabel>Price</FormLabel>
                <Input
                  type="number"
                  name="price"
                  {...formik.getFieldProps('price')}
                />
                <FormErrorMessage>{formik.errors.price}</FormErrorMessage>
              </FormControl>
            </Box>
            <Button
              alignSelf={'center'}
              disabled={!(formik.isValid && formik.dirty)}
              loadingText="Submitting"
              size="md"
              colorScheme={'messenger'}
              isLoading={formik.isSubmitting}
              onClick={formik.handleSubmit}
            >
              Add Recipe
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SuccessModal;
