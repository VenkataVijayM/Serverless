// Description - This file responsible for displaying list of valid order complaints and an option to chat or show chat.
// References - 
// 1 - https://firebase.google.com/docs/firestore/quickstart
// 2 - https://www.npmjs.com/package/react-firebase-hooks
import { useCookies } from 'react-cookie';
import firebase from 'firebase/compat/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { firebaseConfig } from '../../config/firebaseconfig';
import 'firebase/compat/firestore';
import { useNavigate } from 'react-router-dom';

import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Button,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';

//initalising firebase app with firebase config details
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

//fetching the data from coolection that stores the details of chatrooms
const query = firestore
  .collection('chat_complaints')

const ChatUsers = () => {
  const navigate = useNavigate();

  const [cookies] = useCookies(['user']);
  console.log(cookies.user.userId);

  const [orders, loading, error, snapshot] = useCollectionData(query, {
    idField: 'id',
  });

  console.log(orders);

  //fucntion to redirect to chatwindow
  const initiateChat = async order => {
    let path = '/chat/' + order.orderId;

    if (order.isResolved === 'true') {
      path = path + '?resolved=true';
    }

    navigate(path);
  };

  const borderColor = useColorModeValue('gray.200', 'white');
  const tableBackground = useColorModeValue('white', 'gray.700');

  // for resolved complaints only show chat will be displayed which has the history of messages 
  // and for unresolved it gives an option to chat
  return (
    <Flex flexDirection={'column'} alignItems={'center'}>
      {orders === undefined || orders.length === 0 ? (
        <Heading>No orders available.</Heading>
      ) : (
        <TableContainer
          borderWidth={'1px'}
          borderColor={borderColor}
          borderRadius={'xl'}
          shadow={'lg'}
          maxW={'70vw'}
        >
          <Table
            borderRadius={'xl'}
            variant="simple"
            background={tableBackground}
          >
            <Thead backgroundColor={borderColor}>
              <Tr>
                <Th>Open Complaints Order Number</Th>
                <Th>Chat</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders
                .filter(order =>
                  cookies.user.isRestaurant
                    ? order.restaurantId === cookies.user.userId
                    : order.customerId === cookies.user.userId
                )
                .map((order, index) => {
                  return (
                    <Tr key={index} borderRadius="md">
                      <Td w={'25%'}>{order.orderId}</Td>
                      <Td w={'25%'}>
                        {
                          <Button
                            size={'sm'}
                            variant={'outline'}
                            onClick={() => initiateChat(order)}
                          >
                            {order.isResolved === 'false' ? 'Chat' : 'Show Chat'}
                          </Button>
                        }
                      </Td>
                    </Tr>
                  );
                })}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Flex>
  );
};

export default ChatUsers;
