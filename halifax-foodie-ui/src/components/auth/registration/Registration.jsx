// Library imports
import {
  Flex,
  Box,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  Link,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';

import axios from 'axios';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

// dependencies
import cognitoUserPool from '../../../config/cognitoUserPool';
import {
  USER_INFO_FUNCTION_URL,
  SECURITY_ANSWERS_FUNCTION_URL,
  CIPHER_DATA_FUNCTION_URL,
} from '../../../config/constants';

// Components
import RegisterOne from './RegisterOne';
import RegisterTwo from './RegisterTwo';
import RegisterThree from './RegisterThree';
import SuccessModal from './SuccessModal';

const Registration = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [step, setStep] = useState(1);

  const [cipher, setCipher] = useState('');

  const modalCloseHandler = () => {
    onClose();
    navigate('/auth/login');
  };

  const userInfoInitialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    isRestaurant: false,
    restaurantName: '',
  };
  const [userInfo, setUserInfo] = useState(userInfoInitialValues);

  const securityAnswersInitialValues = {
    answerOne: '',
    answerTwo: '',
    answerThree: '',
  };
  const [securityAnswers, setSecurityAnswers] = useState(securityAnswersInitialValues);

  const thirdFactorInfoInitialValues = {
    plainText: '',
    key: '',
  };
  const [thirdFactorInfo, setThirdFactorInfo] = useState(thirdFactorInfoInitialValues);

  const reset = () => {
    setUserInfo(userInfoInitialValues);
    setSecurityAnswers(securityAnswersInitialValues);
    setThirdFactorInfo(thirdFactorInfoInitialValues);
    setStep(1);
  };

  const handleStepOneNext = userInfoData => {
    setUserInfo(userInfoData);
    setStep(2);
  };

  const handleStepTwoNext = securityAnswersData => {
    setSecurityAnswers(securityAnswersData);
    setStep(3);
  };

  const handleStepThreeNext = thirdFactorData => {
    setThirdFactorInfo(thirdFactorData);
  };

  useEffect(() => {
    // Cancel initial useEffect calls made by react
    if (step < 3) return;

    const submitRegistration = () => {
      const userEmailAttribute = new CognitoUserAttribute({
        Name: 'email',
        Value: userInfo.email,
      });

      cognitoUserPool.signUp(
        userInfo.email,
        userInfo.password,
        [userEmailAttribute],
        null,
        async (err, data) => {
          if (err) {
            // Handle error
            switch (err.code) {
              case 'UsernameExistsException':
                toast({
                  title: 'Error',
                  description: err.message,
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
                reset();
                break;
  
              default:
                console.error(err);
                break;
            }
          } else {
            const userId = data.userSub;
            const email = userInfo.email;
  
            const reqList = [
              // Save user info in DynamoDB
              axios.post(USER_INFO_FUNCTION_URL, { userId, ...userInfo }),
  
              // save security answers in FireStore
              axios.post(SECURITY_ANSWERS_FUNCTION_URL, {
                userId,
                email,
                ...securityAnswers,
              })
            ];
  
            try {
              // Hit APIs parallely
              // Save user info in DDB and security answers in FireStore
              await Promise.all(reqList);

              // Save third factor data in DynamoDB
              const thirdFactorInfoResponse = await axios.post(CIPHER_DATA_FUNCTION_URL, {
                action: 'SAVE',
                userId,
                ...thirdFactorInfo,
              })

              toast({
                title: 'Registration successful',
                status: 'success',
                duration: 5000,
                isClosable: true,
              });

              setCipher(thirdFactorInfoResponse.data.cipher);
              onOpen();
            } catch (error) {
              console.error(error);
            }
          }
        }
      );
    };
    submitRegistration();
  }, [thirdFactorInfo]);


  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Register to the platform
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
              <RegisterOne onNext={handleStepOneNext}></RegisterOne>
            )}
            {step === 2 && (
              <RegisterTwo onNext={handleStepTwoNext}></RegisterTwo>
            )}
            {step === 3 && (
              <RegisterThree onNext={handleStepThreeNext}></RegisterThree>
            )}

            <Stack pt={6}>
              <Text align={'center'}>
                Already a user?{' '}
                <Link
                  color={'blue.400'}
                  onClick={() => navigate('/auth/login')}
                >
                  Login
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
      <SuccessModal cipherText={cipher} isOpen={isOpen} onClose={modalCloseHandler}/>
    </Flex>
  );
};

export default Registration;
