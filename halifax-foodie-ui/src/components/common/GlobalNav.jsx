import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  Button,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// import { ColorModeSwitcher } from './../../ColorModeSwitcher';

const Links = (loggedInUser) => {
  // Links that are always available
  let list = [
    {
      label: 'Visualization',
      path: '/visualization',
    },
  ];

  if (loggedInUser) {
    if (loggedInUser.isRestaurant) {
      // Restaurant links
      list = [
        ...list,
        {
          label: 'Recipe upload',
          path: '/recipe-upload',
        },
        {
          label: 'Recipe similarity',
          path: '/recipe-similarity',
        },
        {
          label: 'Feedback',
          path: '/feedback',
        },
      ]
    }

    // Common for logged in users
    list = [
      ...list,
      {
        label: 'Chat',
        path: '/chat-users',
      },
    ]
  }


  return list
};

const NavLink = props => {
  const navigate = useNavigate();
  return <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    onClick={() => navigate(props.path)}
  >
    {props.children}
  </Link>
};

const ButtonSection = (props) => {
  const navigate = useNavigate();

  const loggedInUser = props.loggedInUser;

  const handleLogout = () => {
    props.handleLogout();
  };

  return (
    <Flex alignItems={'center'}>
      {
        loggedInUser ? (
          <Button
            size="sm"
            colorScheme={'messenger'}
            onClick={handleLogout}
          >
            Logout
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              colorScheme={'messenger'}
              onClick={() => navigate('auth/login')}
            >
              Sign In
            </Button>

            <Button
              ml={2}
              size="sm"
              colorScheme={'messenger'}
              onClick={() => navigate('auth/register')}
            >
              Register
            </Button>
          </>
        ) 
      }
      {/* <ColorModeSwitcher justifySelf="flex-end" /> */}
    </Flex>
  )
};

const GlobalNav = () => {

  const [cookies, removeCookie] = useCookies();
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    if (
      'user' in cookies &&
      typeof cookies.user === 'object'
    ) {
      setLoggedInUser(cookies.user);
    } else {
      setLoggedInUser(null);
    }
  }, [cookies]);

  const handleLogout = () => {
    removeCookie('user');
  };

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4} shadow={'xl'}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <HStack spacing={8} alignItems={'center'}>
          <Box><Heading size={'md'}>Halifax Foodie</Heading></Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links(loggedInUser).map(link => (
              <NavLink key={link.label} path={link.path}>{link.label}</NavLink>
            ))}
          </HStack>
        </HStack>
        <ButtonSection loggedInUser={loggedInUser} handleLogout={handleLogout}/>
      </Flex>
    </Box>
  );
};

export default GlobalNav;
