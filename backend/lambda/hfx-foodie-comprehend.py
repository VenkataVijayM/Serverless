import json
import os
import boto3

# Read table name from env or fallback to 'hfx_foodie_recipes'
TABLE_NAME = os.environ.get('DDB_RECIPE_TABLE_NAME', 'hfx_foodie_recipes')

# Read bucket name from env or fallback to 'halifax-foodie-bucket'
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME', 'halifax-foodie-bucket')

# Read bucket folder name from env or fallback to 'recipes'
BUCKET_FOLDER_NAME = os.environ.get('S3_BUCKET_FOLDER_NAME', 'recipes')

# get DDB resource and user table
ddb_resource = boto3.resource("dynamodb")
recipe_table = ddb_resource.Table(TABLE_NAME)

# Create S3 client
s3_client = boto3.client(service_name="s3", region_name="us-east-1")

# Create Comprehend client
comprehend_client = boto3.client(service_name="comprehend", region_name="us-east-1")

ERROR_500_RESPONSE = {
    "statusCode": 500,
    "body": json.dumps({ "error": "Internal system error" })
}

def lambda_handler(event, context):

    # get the HTTP method type
    method = event.get("requestContext").get("http").get("method")
    if method == "POST":
        # extract request payload
        req_body = event.get("body")
        if req_body is None:
            return { "statusCode": 400, "body": json.dumps({ "error": "Request body required" }) }

        # parse payload
        req_payload = json.loads(req_body)
        recipe_id = req_payload.get("recipeId", None)
        if recipe_id is None:
            return {
                "statusCode": 400,
                "body": json.dumps({ "error": "recipeId is required" })
            }

        # get content of recipe
        success, recipe = get_recipe_from_ddb(recipe_id)
        if success is False:
            return {
                "statusCode": 400,
                "body": json.dumps({ "error": "Recipe not available. recipeId=" + recipe_id })
            }

        # extract ingredients from recipe content
        success, ingredients = extract_ingredients(recipe)
        if success is False:
            return ERROR_500_RESPONSE

        # save ingredients in database
        save_ingredients_in_ddb(recipe.get("recipeId"), ingredients)

        # send ingredients in response
        return {'statusCode': 200, 'body': json.dumps(ingredients)}

    else:
        return {'statusCode': 405, 'body': json.dumps('Allowed method: POST')}


# handler function to read recipe file from S3 and 
# extracting ingredients using comprehend 
def extract_ingredients(recipe):

    user_id = recipe.get("userId")
    recipe_id = recipe.get("recipeId")
    FILE_NAME = BUCKET_FOLDER_NAME + '/' + user_id + '/' + recipe_id + '.txt'

    try:
        # get S3 object
        s3_response = s3_client.get_object(Bucket=BUCKET_NAME, Key=FILE_NAME)
        
        # read file content
        file_content = s3_response.get('Body').read().decode('utf-8')

        # extrect entities
        comprehend_response = comprehend_client.detect_entities(Text=file_content, LanguageCode='en')

        ingredients = []
        for item in comprehend_response.get("Entities"):
            ingredients.append(item.get("Text"))

        return True, ingredients

    except Exception as e:
        print(e)
        return False, []

def get_recipe_from_ddb(recipe_id):

    response = recipe_table.get_item(Key={'recipeId': recipe_id})
    recipe = response.get('Item', None)

    if recipe is None:
        return False, None

    return True, recipe

def save_ingredients_in_ddb(recipe_id, ingredients):

    recipe_table.update_item(
        Key={ "recipeId": recipe_id },
        UpdateExpression='SET ingredients=:ingredient_list',
        ExpressionAttributeValues={
            ':ingredient_list': ingredients
        }
    )

