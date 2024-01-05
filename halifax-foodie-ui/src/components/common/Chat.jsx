// Description - This file responsible for chat window, send and resolve button. This fetches messages from firestore real time. 
// References - 
// 1 - https://firebase.google.com/docs/firestore/quickstart
// 2 - https://www.npmjs.com/package/react-firebase-hooks

import ChatMessages from "./ChatMessages";
import { useCookies } from 'react-cookie';
import firebase from 'firebase/compat/app';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { firebaseConfig } from '../../config/firebaseconfig';
import { Button, Divider, Flex,  Input } from "@chakra-ui/react";
import { useState } from "react";
import 'firebase/compat/firestore';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

//initialising firebase app with config details
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

const Chat = () => {
    const [cookies] = useCookies(["user"]);
    
    const navigate = useNavigate();
    
    const {orderId} = useParams();
    
    //fetching collesction data based on orderid which is unique
    const messagesRef = firestore.collection(orderId);
    const query = messagesRef.orderBy('createdAt').limit(25);

    const [searchParams] = useSearchParams();

    const [messages] = useCollectionData(query, { idField: 'id' });
    
    const [inputMessage, setInputMessage] = useState("");

    //logic to add a document in firestore collection when a message is added
    const handleSendMessage = async () => {

        const uid = cookies.user.userId;
        console.log(uid);

        await messagesRef.add({
            text: inputMessage,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid
        })

        setInputMessage('');
    }

    //logic to update isresolved status of chatroom when it is ersolved
    const handleResolveChat = async () => {
        const updateCol = firestore.collection('chat_complaints').doc(orderId);
        await updateCol.update({isResolved:'true'});
        navigate("/chat-users");
    }

    return (
        <Flex w="100%" h="80vh" justify="center" align="center">

            <Flex minW={'70vw'} border={'1px'} borderRadius={'lg'} h="90%" py={2} flexDir="column">
                
                <ChatMessages messages={messages} order={orderId} />

                {!searchParams.get('resolved') && <Divider w="100%" borderBottomWidth="3px" color="black" mt="5" />}

                { !searchParams.get('resolved') && <Flex w="100%" mt="5" px={2}>
                    <Input
                        placeholder="Type Something..."
                        border="none"
                        borderRadius="none"
                        _focus={{
                            border: "1px solid black",
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                handleSendMessage();
                            }
                        }}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                    />

                    <Button
                        ml={1}
                        size="md"
                        colorScheme={'messenger'}
                        disabled={inputMessage.trim().length <= 0}
                        onClick={handleSendMessage}
                    >
                        Send
                    </Button>

                    <Button
                        ml={1}
                        size="md"
                        colorScheme={'whatsapp'}
                        onClick={handleResolveChat}
                    >
                        Resolve
                    </Button>
                </Flex>
                }

            </Flex>

        </Flex>
    )
}

export default Chat;