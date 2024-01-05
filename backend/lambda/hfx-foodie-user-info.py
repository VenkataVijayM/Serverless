import os
import json
import boto3

# Read table name from env or fallback to 'hfx_foodie_users'
TABLE_NAME = os.environ.get('DDB_USER_TABLE_NAME',  'hfx_foodie_users')

# get DDB resource and user table
ddb_resource = boto3.resource("dynamodb")
USER_TABLE = ddb_resource.Table(TABLE_NAME)

ERROR_500_RESPONSE = {
    "statusCode": 500,
    "body": json.dumps({ "error": "Internal system error" })
}

def lambda_handler(event, context):
    
    # get the HTTP method type
    method = event.get("requestContext").get("http").get("method")
    
    if method == "POST":
        # extract req payload
        req_body = event.get("body")
        if req_body is None:
            return {
                "statusCode": 400,
                "body": json.dumps({ "error": "Request body required" })
            }
    
        # parse payload
        req_payload = json.loads(req_body)
        
        # call handler function to handle validations
        success, errors = handle_req_payload(req_payload)
        if success is False:
            return {
                "statusCode": 400,
                "body": json.dumps({ "error": errors })
            }

        user = req_payload
        is_restaurant = user.get("isRestaurant", False)
        
        # reset restaurantName if it is not restaurant
        user["restaurantName"] = user["restaurantName"] if is_restaurant else ""
        
        # save user in database
        success = save_user_in_ddb(user)
        
        return {
            'statusCode': 200,
            'body': json.dumps(success)
        }
    
    elif method == "GET":
        # extract query params
        query_params = event.get("queryStringParameters", None)
        
        # if query params are not provided or 
        # 'userId' key in query params is not present 
        if query_params is None or query_params.get("userId", None) is None:
            return {
                'statusCode': 200,
                'body': None
            }
        else:
            user_id = query_params.get("userId", None)
            
            # fetch user details from database
            success, user = get_user_from_ddb(user_id)
            if success is False:
                return ERROR_500_RESPONSE
                
            return {
                'statusCode': 200,
                'body': json.dumps(user)
            }

    return {
        'statusCode': 405,
        'body': json.dumps('Allowed method: GET, POST')
    }

def save_user_in_ddb(user):
    
    try:
        USER_TABLE.put_item(Item=user)
        return True

    except Exception as e:
        print(e)
        return False
        
def get_user_from_ddb(user_id):

    user = None
    try:
        response = USER_TABLE.get_item(Key={'userId': user_id})
        user = response.get("Item", None)
        
        if user is None:
            print("User not available in DDB. userId=" + user_id)

        return True, user

    except Exception as e:
        print(e)
        return False

# handler function to validate request payload
# returns True if payload is valid
# returnd False and list of errors if payload is invalid
def handle_req_payload(req_payload):
    errors = []
    
    # extract expected values from payload or fallback to None
    user_id = req_payload.get("userId", None)
    email = req_payload.get("userId", None)
    is_restaurant = req_payload.get("isRestaurant", None)

    if user_id is None:
        errors.append("userId is required")
        
    if email is None:
        errors.append("email is required")

    if is_restaurant is None:
        errors.append("isRestaurant is required")
    else:
        if is_restaurant:
            restaurant_name = req_payload.get("restaurantName", None)
            if restaurant_name is None:
                errors.append("restaurantName is required")

    if len(errors) > 0:
        return False, errors
        
    return True, []
