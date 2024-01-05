import { CopyIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';

const SuccessModal = ({ cipherText, isOpen, onClose }) => {
  const copyTextToClipboard = async () => {
    await navigator.clipboard.writeText(cipherText);
  };

  return (
    <Modal
      size={'xl'}
      isCentered
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent>
        <ModalHeader>Important!</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="md" mb={2}>
            Please verify your account via an email sent to your email address.
          </Text>
          <Text fontSize="md" mb={2}>
            Save this ciphered text. This will be used to verify your identity
            while logging in.
          </Text>

          <HStack justifyContent={'center'}>
            <Text
              fontSize="md"
              fontFamily={'monospace'}
              color={'red.800'}
              backgroundColor={'red.100'}
            >
              {cipherText}
            </Text>
            <Tooltip label="Copy to clipboard">
              <IconButton
                aria-label="Copy to clipboard"
                size={'sm'}
                variant={'solid'}
                icon={<CopyIcon />}
                onClick={copyTextToClipboard}
              />
            </Tooltip>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SuccessModal;
