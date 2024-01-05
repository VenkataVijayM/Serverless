// Description - This file responsible for calling lambda to calculate polarity and visualize. 
//              The visualization is displayed in an iframe with data studio link

import { Flex } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect } from 'react';
import { POLARITY_FUNCTION_URL } from '../../config/constants';
import { useCookies } from 'react-cookie';


const FeedbackPolarity = () => {
    
    const [cookies] = useCookies(["user"]);

    //axios  call to lambda responsible for calculating polarity  and sending data for visualisation
    useEffect(()=>{const fetchPolarity = async () => {
        await axios.get(POLARITY_FUNCTION_URL, { params: { userId: cookies.user.userId } });
    }
    fetchPolarity();    },[cookies])


//returns iframe containing data studio visualisation
return (
    <Flex flexDirection={'column'} alignItems={'center'}>
        <iframe title="polarityVisual" width="800" height="600" src="https://datastudio.google.com/embed/reporting/f5f073e7-2934-45c8-852e-bc0ac944a41d/page/KIZ8C" frameBorder="0" allowFullScreen></iframe>
    </Flex> 
    );
};

export default FeedbackPolarity;