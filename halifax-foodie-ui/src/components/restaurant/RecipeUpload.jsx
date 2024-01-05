import { Box, Button, Flex, useDisclosure } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { COMPREHEND_FUNCTION_URL, PRESIGNED_URL_FUNCTION_URL, RECIPE_FUNCTION_URL } from '../../config/constants';
import RecipeList from './RecipeList';
import AddRecipeModal from './AddRecipeModal';
import { useCookies } from 'react-cookie';

const readFile = file => {
  return new Promise((resolve, reject) => {
    var fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result);
    };
    fr.onerror = reject;
    fr.readAsText(file);
  });
};

const RecipeUpload = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [recipes, setRecipes] = useState([]);

  const [cookies] = useCookies();

  useEffect(() => {
    const fetchRecipes = async () => {
      const response = await axios.get(RECIPE_FUNCTION_URL, { params: { userId: cookies.user.userId } });
      setRecipes(response.data);
    }

    fetchRecipes();
  }, [cookies.user]);

  const uploadHandler = async (recipe, selectedFile) => {
    const reqPayload = {
      userId: cookies.user.userId,
      recipeId: recipe.recipeId
    };
    const fileContent = await readFile(selectedFile);

    try {
      // get presigned url from lambda
      const preSignedURLResponse = await axios.post(PRESIGNED_URL_FUNCTION_URL, reqPayload);
    
      // Upload content to S3 object using pre-signed URL
      await axios.put(preSignedURLResponse.data, fileContent);

      const updatedResponse = await axios.put(RECIPE_FUNCTION_URL, { ...recipe, isUploaded: true });

      // Update recipe in state
      setRecipes(recipes.map(recipe => recipe.recipeId === updatedResponse.data.recipeId ? updatedResponse.data : recipe));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddRecipe = async (recipeName, price) => {
    const reqPayload = {
      userId: cookies.user.userId,
      restaurantName: cookies.user.restaurantName,
      recipeName,
      price,
    };
    
    try {
      // Add new recipe in database
      const response = await axios.post(RECIPE_FUNCTION_URL, reqPayload);
    
      // Add new recipe in state
      setRecipes([...recipes, response.data]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExtractIngredients = async recipeToExtract => {
    try {
      // Extract ingredients from recipe
      const response = await axios.post(COMPREHEND_FUNCTION_URL, { recipeId: recipeToExtract.recipeId });
      const ingredients = response.data;
    
      // Update recipe in state
      setRecipes(recipes.map(r => r.recipeId === recipeToExtract.recipeId ? { ...r, ingredients } : r));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Flex flexDirection={'column'} alignItems={'center'}>
      <Box>
        <Button
          mb={4}
          size="sm"
          colorScheme={'messenger'}
          onClick={onOpen}
        >
          Add recipe
        </Button>
      </Box>
      <RecipeList recipes={recipes} onUpload={uploadHandler} onExtractIngredients={handleExtractIngredients} />
      <AddRecipeModal isOpen={isOpen} onClose={onClose} onAddRecipe={handleAddRecipe} />
    </Flex>
  );
};

export default RecipeUpload;
