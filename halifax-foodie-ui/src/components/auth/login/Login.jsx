import {
  Flex,
  Box,
  Stack,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';

import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import axios from 'axios';

// Components
import LoginOne from './LoginOne';
import LoginTwo from './LoginTwo';
import LoginThree from './LoginThree';

import { USER_INFO_FUNCTION_URL, LOGIN_INFO_FUNCTION_URL } from '../../../config/constants';
import { useCookies } from 'react-cookie';


const Login = () => {
  const navigate = useNavigate();

  const [cookies, setCookie] = useCookies(['user']);

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);

  const handleStepOneNext = (userID) => {
    setUserId(userID)
    setStep(2)
  }
  const handleStepTwoNext = () => {
    setStep(3)
  }
  const handleStepThreeNext = async () => {
    try {
      // fetch user info and save in local storage
      const response = await axios.get(USER_INFO_FUNCTION_URL, { params: { userId } })

      setCookie('user', JSON.stringify(response.data), { path: '/' });

      // delete irrelevant data before saving login info in firestore
      const userData = response.data;
      delete userData.cipherKey;
      delete userData.cipherPlainText;

      // save user login info in firestore
      await axios.post(LOGIN_INFO_FUNCTION_URL, userData)

      navigate('/');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>
            Sign In to your account
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4}>
            {step === 1 && (
              <LoginOne onNext={handleStepOneNext}></LoginOne>
            )}
            {step === 2 && (
              <LoginTwo userId={userId} onNext={handleStepTwoNext}></LoginTwo>
            )}
            {step === 3 && (
              <LoginThree userId={userId} onNext={handleStepThreeNext}></LoginThree>
            )}
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
