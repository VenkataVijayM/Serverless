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
} from '@chakra-ui/react';

const validationSchema = Yup.object({
  plainText: Yup.string().required('Plain text is required.'),
  key: Yup.string().required('Key is required.').length(4, "Key should be 4 characters long."),
});

const RegisterThree = (props) => {
  const formik = useFormik({
    initialValues: {
      plainText: '',
      key: '',
    },
    onSubmit: (values, actions) => {
      actions.setSubmitting(true);

      props.onNext(values);

      actions.setSubmitting(false);
    },
    validationSchema,
  });

  return (
    <Stack>
      <Box>
        <FormControl
          id="plainText"
          isRequired
          isInvalid={formik.touched.plainText && formik.errors.plainText}
        >
          <FormLabel>Plain text for columnar cipher</FormLabel>
          <Input
            type="text"
            name="plainText"
            {...formik.getFieldProps('plainText')}
          />
          <FormErrorMessage>{formik.errors.plainText}</FormErrorMessage>
        </FormControl>
      </Box>

      <Box>
        <FormControl
          id="key"
          isRequired
          isInvalid={formik.touched.key && formik.errors.key}
        >
          <FormLabel>Key for columnar cipher</FormLabel>
          <Input
            type="text"
            name="key"
            {...formik.getFieldProps('key')}
          />
          <FormErrorMessage>{formik.errors.key}</FormErrorMessage>
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
};

export default RegisterThree;

