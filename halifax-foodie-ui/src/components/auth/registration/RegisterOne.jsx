import { useState } from 'react';

import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  FormErrorMessage,
  Checkbox,
} from '@chakra-ui/react';

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

import { COGNITO_PASSWORD_REGEX } from '../../../config/constants';

// Create the validation schema for the form
const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required.'),
  lastName: Yup.string().required('Last name is required.'),
  email: Yup.string()
    .required('Email is required.')
    .email('Email must be a valid email address.'),
  password: Yup.string()
    .required('Password is required.')
    .matches(COGNITO_PASSWORD_REGEX, "Password must be at least 8 characters and contain uppercase, lowercase, special character and number."),
  isRestaurant: Yup.boolean(),
  restaurantName: Yup.string().when('isRestaurant', {
    is: true,
    then: Yup.string().required('Restaurant name is required.'),
  }),
});

const RegisterOne = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      isRestaurant: false,
      restaurantName: '',
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
      <HStack justifyContent={'center'}>
        <Checkbox name="isRestaurant" {...formik.getFieldProps('isRestaurant')}>
          Register restaurant ?
        </Checkbox>
      </HStack>
      {formik.values.isRestaurant && (
        <Box>
          <FormControl
            id="restaurantName"
            isRequired
            isInvalid={
              formik.touched.restaurantName && formik.errors.restaurantName
            }
          >
            <FormLabel>Restaurant name</FormLabel>
            <Input
              type="text"
              name="restaurantName"
              {...formik.getFieldProps('restaurantName')}
            />
            <FormErrorMessage>{formik.errors.restaurantName}</FormErrorMessage>
          </FormControl>
        </Box>
      )}
      <HStack>
        <Box>
          <FormControl
            id="firstName"
            isRequired
            isInvalid={formik.touched.firstName && formik.errors.firstName}
          >
            <FormLabel>First name</FormLabel>
            <Input
              type="text"
              name="firstName"
              {...formik.getFieldProps('firstName')}
            />
            <FormErrorMessage>{formik.errors.firstName}</FormErrorMessage>
          </FormControl>
        </Box>

        <Box>
          <FormControl
            id="lastName"
            isRequired
            isInvalid={formik.touched.lastName && formik.errors.lastName}
          >
            <FormLabel>Last name</FormLabel>
            <Input
              type="text"
              name="lastName"
              {...formik.getFieldProps('lastName')}
            />
            <FormErrorMessage>{formik.errors.lastName}</FormErrorMessage>
          </FormControl>
        </Box>
      </HStack>
      <Box>
        <FormControl
          id="email"
          isRequired
          isInvalid={formik.touched.email && formik.errors.email}
        >
          <FormLabel>Email</FormLabel>
          <Input type="text" name="email" {...formik.getFieldProps('email')} />
          <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
        </FormControl>
      </Box>
      <Box>
        <FormControl
          id="password"
          isRequired
          isInvalid={formik.touched.password && formik.errors.password}
        >
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              {...formik.getFieldProps('password')}
            />
            <InputRightElement h={'full'}>
              <Button
                variant={'ghost'}
                onClick={() => setShowPassword(showPassword => !showPassword)}
              >
                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
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

export default RegisterOne;
