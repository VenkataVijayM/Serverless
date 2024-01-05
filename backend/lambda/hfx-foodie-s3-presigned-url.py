import os
import json
import boto3
from botocore.config import Config

# Read URL expiration time from env or fallback to 120 sec
PRESIGNED_URL_EXPIRATION_TIME = int(os.environ.get("PRESIGNED_URL_EXPIRATION_TIME", 120))

# Read bucket name from env or fallback to 'halifax-foodie-bucket'
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME', 'halifax-foodie-bucket')

# Read bucket folder name from env or fallback to 'recipes'
BUCKET_FOLDER_NAME = os.environ.get('S3_BUCKET_FOLDER_NAME', 'recipes')

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
        success, payload, errors = handle_req_payload(req_payload)
        if success is False:
            return {
                "statusCode": 400,
                "body": json.dumps({ "error": errors })
            }
            
        user_id = payload["user_id"]
        recipe_id = payload["recipe_id"]

        # get pre-signed URL for S3 object that can be used to upload file 
        success, url = get_signed_url(user_id, recipe_id)
        if success:
            return { 'statusCode': 200, 'body': url }
            
        else:
            return ERROR_500_RESPONSE
    
    return {
        'statusCode': 405,
        'body': json.dumps('Allowed method: POST')
    }        

def get_signed_url(user_id, recipe_id):
    try:
        # get S3 client
        s3_client = boto3.client(
            's3', 
            config=Config(
                s3={ 'addressing_style': 'path' }, 
                signature_version='s3v4'
            )
        )

        # construct file name
        FILE_NAME = BUCKET_FOLDER_NAME + "/" + user_id + "/" + recipe_id + ".txt"
        print(FILE_NAME)
        
        # generate presigned URL
        url = s3_client.generate_presigned_url(
            ClientMethod = 'put_object',
            Params = {
                'Bucket': BUCKET_NAME,
                'Key': FILE_NAME
            },
            ExpiresIn = PRESIGNED_URL_EXPIRATION_TIME
        )
        return True, url

    except Exception as e:
        print(e)
        return False, None

# handler function to validate request payload
# returns True and dict of expected values if payload is valid
# returnd False and list of errors if payload is invalid
def handle_req_payload(req_payload):
    errors = []
    data = {
        "user_id": req_payload.get("userId", None),
        "recipe_id": req_payload.get("recipeId", None)
    }

    if data["user_id"] is None:
        errors.append("userId is required")
        
    if data["recipe_id"] is None:
        errors.append("recipeId is required")

    if len(errors) > 0:
        return False, {}, errors
        
    return True, data, []