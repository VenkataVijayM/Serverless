import os
import json
import boto3
import uuid
from boto3.dynamodb.conditions import Attr

# Read table name from env or fallback to 'hfx_foodie_recipes'
TABLE_NAME = os.environ.get('DDB_RECIPE_TABLE_NAME', 'hfx_foodie_recipes')

# get DDB resource and user table
ddb_resource = boto3.resource("dynamodb")
RECIPE_TABLE = ddb_resource.Table(TABLE_NAME)

ERROR_500_RESPONSE = {
    "statusCode": 500,
    "body": json.dumps({ "error": "Internal system error" })
}

def lambda_handler(event, context):
    
    # get the HTTP method type
    method = event.get("requestContext").get("http").get("method")
    
    # return error if method not allowed
    if method not in ["GET", "POST", "PUT"]:
        return {
            'statusCode': 405,
            'body': json.dumps('Allowed method: GET, POST, PUT')
        }

    if method == "GET":
        # extract query params
        query_params = event.get("queryStringParameters", None)
        
        # if query params are not provided or 
        # 'userId' key in query params is not present 
        if query_params is None or query_params.get("userId", None) is None:
            
            # get list of all the recipes available in database
            data = get_all_recipes()
            if data is None:
                return ERROR_500_RESPONSE
                
            return { 'statusCode': 200, 'body': data }
            
        elif query_params.get("userId", None) is not None:
            
            # get list of recipes of the restaurant 
            data = get_restaurant_recipes(query_params.get("userId"))
            if data is None:
                return ERROR_500_RESPONSE

            return { 'statusCode': 200, 'body': data }
    
    if method == "POST" or method == "PUT":
        # extract request payload
        req_body = event.get("body")
        if req_body is None:
            return {
                "statusCode": 400,
                "body": json.dumps({ "error": "Request body required" })
            }
    
    # parse payload
    req_payload = json.loads(event.get("body"))
    if method == "POST":
        if req_payload.get("userId", None) is None:
            return {
                "statusCode": 400,
                "body": json.dumps({ "error": "userId is required" })
            }

        data = save_recipe_in_ddb(req_payload)
        if data is None:
            return ERROR_500_RESPONSE
        
        return { "statusCode": 200, "body": data }
    
    if method == "PUT":
        if req_payload.get("recipeId", None) is None:
            return {
                "statusCode": 400,
                "body": json.dumps({ "error": "recipeId is required" })
            }
            
        data = update_recipe_in_ddb(req_payload)
        if data is None:
            return ERROR_500_RESPONSE
        
        return { "statusCode": 200, "body": data }

def get_restaurant_recipes(userId):
    
    try:
        response = RECIPE_TABLE.scan(
            FilterExpression=Attr('userId').eq(userId)
        )
        items = response.get('Items', [])
        return items

    except Exception as e:
        print(e)
        return None

def get_all_recipes():
    
    try:
        response = RECIPE_TABLE.scan()
        items = response.get('Items', [])
        return items

    except Exception as e:
        print(e)
        return None

def save_recipe_in_ddb(recipe):
    
    # generate uniquid id and set default values
    recipe['recipeId'] = str(uuid.uuid4())
    recipe['isUploaded'] = False
    recipe['ingredients'] = recipe.get("ingredients", [])

    try:
        RECIPE_TABLE.put_item(Item=recipe)
        return recipe

    except Exception as e:
        print(e)
        return None

# utility funciton to construct update_expression for update_item()
def get_update_expression(recipe):
    update_expression = 'SET'

    for key, value in recipe.items():
        if key == 'recipeId':
            continue

        update_expression += ' ' + key + ' = :hfx_' + key + ','

    return update_expression[:-1]

# utility funciton to construct expression_attribute_values for update_item()
def get_expression_attribute_values(recipe):
    expression_attribute_values = {}

    for key, value in recipe.items():
        if key == 'recipeId':
            continue

        expression_attribute_values[':hfx_' + key] = value

    return expression_attribute_values

def update_recipe_in_ddb(recipe):

    update_expression = get_update_expression(recipe)
    expression_attribute_values = get_expression_attribute_values(recipe)

    try:
        RECIPE_TABLE.update_item(
            Key={ 'recipeId': recipe.get('recipeId') },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )
        
        res = RECIPE_TABLE.get_item(Key={ 'recipeId': recipe.get('recipeId') })
        return res.get('Item')

    except Exception as e:
        print(e)
        return None
