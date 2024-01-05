import { AddIcon } from '@chakra-ui/icons';
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
  Text,
  Tooltip,
  Link,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

const RecipeList = props => {
  const recipes = props.recipes || [];

  const [currentUploadRecipe, setCurrentUploadRecipe] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [currentExtractRecipe, setCurrentExtractRecipe] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const fileInputRef = useRef(null);

  const handleAddButtonClick = recipe => {
    setCurrentUploadRecipe(recipe);
    fileInputRef.current.click();
  };

  const handleExtractButtonClick = async recipe => {
    setCurrentExtractRecipe(recipe);

    setIsExtracting(true);
    await props.onExtractIngredients(recipe);
    setIsExtracting(false);
    setCurrentExtractRecipe(null);
  };

  const uploadHandler = async () => {
    const selectedFile = fileInputRef.current.files[0];
    setIsUploading(true);
    await props.onUpload(currentUploadRecipe, selectedFile);
    setIsUploading(false);
    setCurrentUploadRecipe(null);
  };

  const borderColor = useColorModeValue('gray.200', 'white');
  const tableBackground = useColorModeValue('white', 'gray.700');

  return recipes.length === 0 ? (
    <Heading>No recipes available.</Heading>
  ) : (
    <TableContainer
      borderWidth={'1px'}
      borderColor={borderColor}
      borderRadius={'xl'}
      shadow={'lg'}
      maxW={'70vw'}
    >
      <Table borderRadius={'xl'} variant="simple" background={tableBackground}>
        <Thead backgroundColor={borderColor}>
          <Tr>
            <Th>Name</Th>
            <Th>Price</Th>
            <Th>File</Th>
            <Th>Ingredients</Th>
          </Tr>
        </Thead>
        <Tbody>
          {recipes.map(recipe => (
            <Tr key={recipe.recipeId} borderRadius="md">
              <Td w={'25%'}>{recipe.recipeName}</Td>
              <Td w={'25%'}>{recipe.price}</Td>
              <Td w={'25%'}>
                {recipe.isUploaded ? (
                  'Uploaded'
                ) : (
                  <Button
                    size={'sm'}
                    variant={'outline'}
                    onClick={() => handleAddButtonClick(recipe)}
                    isLoading={currentUploadRecipe?.recipeId === recipe.recipeId && isUploading}
                  >
                    <AddIcon />
                  </Button>
                )}
              </Td>
              <Td w={'25%'}>
                {
                  recipe.isUploaded ? (
                    recipe.ingredients.length > 0 ? (<>
                      <Text as={'span'}>{`${recipe.ingredients[0]}, ${recipe.ingredients[1]}, ...`}</Text>
                      <Tooltip label={recipe.ingredients.join(', ')}>
                        <Link color={'blue.400'}>more</Link>
                      </Tooltip>
                      </>
                    ) : (
                      <Button
                        size={'sm'}
                        variant={'outline'}
                        onClick={() => handleExtractButtonClick(recipe)}
                        isLoading={currentExtractRecipe?.recipeId === recipe.recipeId && isExtracting}
                      >
                        Extract ingredients
                      </Button>
                    )
                  ) : "-" 
                }
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <input
        hidden
        ref={fileInputRef}
        type={'file'}
        onChange={e => uploadHandler(e)}
      />
    </TableContainer>
  );
};

export default RecipeList;
