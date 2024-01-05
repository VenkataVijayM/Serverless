// Description - This file responsible for calling lambda to fetch list of recipes
//              For each recipe displayed if the ingredients are present it will 
//              provide an option to fect similar recipes and displays them

import axios from 'axios';
import { useState, useEffect } from 'react';
import {
  RECIPE_FUNCTION_URL,
  SIMILAR_RECIPES_FUNCTION_URL,
} from '../../config/constants';
import { useCookies } from 'react-cookie';

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
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import SimilarRecipeModal from './SimilarRecipeModel';

const SimilarityRecipes = props => {
  const [cookies] = useCookies(['user']);
  const [recipes, setRecipes] = useState([]);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  //fetches list of recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      const response = await axios.get(RECIPE_FUNCTION_URL, {
        params: { userId: cookies.user.userId },
      });
      const list = response.data.map(recipe => {
        return { ...recipe, similarRecipes: [] };
      });
      setRecipes(list);
    };
    fetchRecipes();
  }, [cookies]);

  const [currentSimilarRecipes, setCurrentSimilarRecipes] = useState(null);

  const [isExtracting, setIsExtracting] = useState(false);

  //axios call to lambda responsible for fetching similar recipes
  const fetchSimilarRecipes = async recipeId => {
    try {
      setIsExtracting(true);
      setCurrentSimilarRecipes(recipeId);
      const response = await axios.get(SIMILAR_RECIPES_FUNCTION_URL, {
        params: { recipeId },
      });
      setSimilarRecipes(response.data);
      onOpen();
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExtracting(false);
      setCurrentSimilarRecipes(null);
    }
  };

  const borderColor = useColorModeValue('gray.200', 'white');
  const tableBackground = useColorModeValue('white', 'gray.700');

  return (
    <Flex flexDirection={'column'} alignItems={'center'}>
      {recipes.length === 0 ? (
        <Heading>No recipes available.</Heading>
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
                <Th>Name</Th>
                <Th>Similar Recipes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recipes.map(recipe => (
                <Tr key={recipe.recipeId} borderRadius="md">
                  <Td w={'25%'}>{recipe.recipeName}</Td>
                  <Td w={'25%'}>
                    {recipe.isUploaded && recipe.ingredients.length > 0 ? (
                      <Button
                        size={'sm'}
                        variant={'outline'}
                        onClick={() => fetchSimilarRecipes(recipe.recipeId)}
                        isLoading={
                          currentSimilarRecipes === recipe.recipeId &&
                          isExtracting
                        }
                      >
                        Fetch Similar Recipes
                      </Button>
                    ) : (
                      '-'
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <SimilarRecipeModal
            similarRecipes={similarRecipes}
            isOpen={isOpen}
            onClose={onClose}
          />
        </TableContainer>
      )}
    </Flex>
  );
};

export default SimilarityRecipes;
