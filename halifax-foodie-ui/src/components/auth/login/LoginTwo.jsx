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
import { SECURITY_ANSWERS_FUNCTION_URL } from '../../../config/constants';

// Create the validation schema for the form
const validationSchema = Yup.object({
  answer1: Yup.string().required('Answer is required.'),
  answer2: Yup.string().required('Answer is required.'),
  answer3: Yup.string().required('Answer is required.'),
});

const LoginTwo = (props) => {
  const userId = props.userId;

  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      answer1: '',
      answer2: '',
      answer3: '',
    },
    onSubmit: async (values, actions) => {
      actions.setSubmitting(true);

      const params = {
        userId: userId,
        answer1: values.answer1,
        answer2: values.answer2,
        answer3: values.answer3,
      }

      try {
        const response = await axios.get(SECURITY_ANSWERS_FUNCTION_URL, { params });

        if (response.data) {
          props.onNext(values);
        } else {
          toast({
            title: "Incorrect answers",
            description: "Please try again",
            status: "error",
            duration: 5000,
            isClosable: true,
          })
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
          id="answer1"
          isRequired
          isInvalid={formik.touched.answer1 && formik.errors.answer1}
        >
          <FormLabel>In what city were you born?</FormLabel>
          <Input
            type="text"
            name="answer1"
            {...formik.getFieldProps('answer1')}
          />
          <FormErrorMessage>{formik.errors.answer1}</FormErrorMessage>
        </FormControl>
      </Box>

      <Box>
        <FormControl
          id="answer2"
          isRequired
          isInvalid={formik.touched.answer2 && formik.errors.answer2}
        >
          <FormLabel>What is the name of your favorite pet?</FormLabel>
          <Input
            type="text"
            name="answer2"
            {...formik.getFieldProps('answer2')}
          />
          <FormErrorMessage>{formik.errors.answer2}</FormErrorMessage>
        </FormControl>
      </Box>

      <Box>
        <FormControl
          id="answer3"
          isRequired
          isInvalid={formik.touched.answer3 && formik.errors.answer3}
        >
          <FormLabel>What is your mother's maiden name?</FormLabel>
          <Input
            type="text"
            name="answer3"
            {...formik.getFieldProps('answer3')}
          />
          <FormErrorMessage>{formik.errors.answer3}</FormErrorMessage>
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
          Next
        </Button>
      </Stack>
    </Stack>
  );
};

export default LoginTwo;
