import { useState } from 'react';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  FormErrorMessage,
  Text,
  Link,
  useToast,
} from '@chakra-ui/react';

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

// dependencies
import cognitoUserPool from '../../../config/cognitoUserPool';
import { COGNITO_PASSWORD_REGEX } from '../../../config/constants';

// Create the validation schema for the form
const validationSchema = Yup.object({
  email: Yup.string()
    .required('Email is required.')
    .email('Email must be a valid email address.'),
  password: Yup.string()
    .required('Password is required.')
    .matches(
      COGNITO_PASSWORD_REGEX,
      'Password must be at least 8 characters and contain uppercase, lowercase, special character and number.'
    ),
});

const LoginOne = props => {
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: (values, actions) => {
      actions.setSubmitting(true);

      const authenticationDetails = new AuthenticationDetails({
        Username: values.email,
        Password: values.password,
      });

      const cognitoUser = new CognitoUser({
        Username: values.email,
        Pool: cognitoUserPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: result => {
          const userId = result.accessToken.payload.sub;

          props.onNext(userId);
          actions.setSubmitting(false);
        },

        onFailure: err => {

          switch (err.code) {
            case 'UserNotConfirmedException':
              toast({
                title: 'Email not confirmed.',
                description: 'Please verify your account via an email sent to your email address.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
              break;

            case 'NotAuthorizedException':
              toast({
                title: 'Incorrect email or password.',
                description: 'Please check your email and password and try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
              break;

            default:
              console.error(err);
              break;
          }
          actions.setSubmitting(false);
        },
      });
    },
    validationSchema,
  });

  return (
    <Stack>
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

      <Stack pt={6}>
        <Text align={'center'}>
          Still not registered on the platform?{' '}
          <Link color={'blue.400'} onClick={() => navigate('/auth/register')}>
            Register
          </Link>
        </Text>
      </Stack>
    </Stack>
  );
};

export default LoginOne;
