import axios from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';

// dependencies
import { CIPHER_DATA_FUNCTION_URL } from '../../../config/constants';

const validationSchema = Yup.object({
  cipher: Yup.string().required('Cipher is required.'),
});

const LoginThree = (props) => {
  const userId = props.userId;

  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      cipher: '',
    },
    onSubmit: async (values, actions) => {
      actions.setSubmitting(true);

      try {
        const response = await axios.post(CIPHER_DATA_FUNCTION_URL, {
          userId,
          action: "CHECK",
          cipher: values.cipher
        })

        if (response.data) {
          await props.onNext(values);
        } else {
          toast({
            title: "Incorrect cipher",
            description: "Please try again",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        actions.setSubmitting(false);
      }
    },
    validationSchema,
  });

  return (
    <Stack>
      <Box>
        <FormControl
          id="cipher"
          isRequired
          isInvalid={formik.touched.cipher && formik.errors.cipher}
        >
          <FormLabel>Cipher text for columnar cipher</FormLabel>
          <Input
            type="text"
            name="cipher"
            {...formik.getFieldProps('cipher')}
          />
          <FormErrorMessage>{formik.errors.cipher}</FormErrorMessage>
        </FormControl>
      </Box>

      <Stack spacing={10} pt={2}>
        <Button
          disabled={!(formik.isValid && formik.dirty)}
          loadingText="Submitting"
          size="lg"
          bg={'blue.400'}
          color={'white'}
          _hover={{
            bg: 'blue.500',
          }}
          isLoading={formik.isSubmitting}
          onClick={formik.handleSubmit}
        >
          Submit
        </Button>
      </Stack>
    </Stack>
  );
}

export default LoginThree;