// Description - This file responsible for displaying list of order complaints and option to chat
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useCookies } from 'react-cookie';

const ChatMessages = ({ messages, order }) => {
    const [cookies] = useCookies(["user"]);
    const [userType, setUserType] = useState("");

    //this will always scrolls to the recent message 
    const AlwaysScrollToBottom = () => {

        const elementRef = useRef();

        useEffect(() => elementRef.current.scrollIntoView());

        return <div ref={elementRef} />;

    };

    //fetching usertype from cookies to use for welcome message in chat
    useEffect(()=>{
        if(cookies.user.isRestaurant) {
            setUserType("Customer");
        } else {
            setUserType("Restaurant Owner");
        }
    },[cookies])

    const othersMessageBGColor = useColorModeValue('gray.100', 'gray.700');
    const othersMessageTextColor = useColorModeValue('black', 'white');

    const myMessageBGColor = useColorModeValue('blue.300', 'blue.700');
    const myMessageTextColor = useColorModeValue('black', 'white');


    return (
        <Flex w="100%" h="100%" overflowY="scroll" flexDirection="column" p="3">

            <Flex key='firstmsg' w="100%">

                <Flex bg={othersMessageBGColor} color={othersMessageTextColor} minW="100px" maxW="350px" my="1" p="3">
                    {
                        
                    }
                    <Text>Welcome, You are in chat with {userType} for OrderId - {order} </Text>

                </Flex>

            </Flex>


            {messages && messages.map((item, index) => {

                if (item.uid === cookies?.user?.userId) {

                    return (

                        <Flex key={index} w="100%" justify="flex-end">

                            <Flex bg={myMessageBGColor} color={myMessageTextColor} minW="100px" maxW="350px" my="1" p="3">

                                <Text>{item.text}</Text>

                            </Flex>

                        </Flex>

                    );

                } else {

                    return (

                        <Flex key={index} w="100%">

                            <Flex bg={othersMessageBGColor} color={othersMessageTextColor} minW="100px" maxW="350px" my="1" p="3">

                                <Text>{item.text}</Text>

                            </Flex>

                        </Flex>

                    );

                }

            })}

            <AlwaysScrollToBottom />

        </Flex>
    )
}

export default ChatMessages;