import os
import json
import boto3
import math

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
    success, payload, errors = handle_req_payload(req_payload)
    if success is False:
        return {
            "statusCode": 400,
            "body": json.dumps({ "error": errors })
        }
    
    user_id = payload.get("user_id")
    action = payload.get("action") 
    success_response = {}
    
    if action == "SAVE":
        key = payload.get("key")
        plain_text = payload.get("plain_text")

        # save key and plain_text in database
        success = save_data_in_ddb(user_id, key, plain_text)
        if success is False:
            return ERROR_500_RESPONSE
        
        # generate cipher
        generated_cipher = encryptMessage(key, plain_text)
        success_response = { "cipher": generated_cipher }

    elif action == "CHECK":
        # extract cipher from payload provided by user
        user_cipher = payload.get("user_cipher")

        # get user details
        success, data = get_data_from_ddb(user_id)
        if success is False:
            return ERROR_500_RESPONSE

        # compute cipher from the key and plainText available in database
        generated_cipher = encryptMessage(data.get("key"), data.get("plain_text"))
        
        # compare the two ciphers
        success_response = (generated_cipher == user_cipher)

    return {
        'statusCode': 200,
        'body': json.dumps(success_response)
    }
    
def save_data_in_ddb(user_id, key, plain_text):
    try:
        USER_TABLE.update_item(
            Key={ 'userId': user_id },
            UpdateExpression='SET cipherKey = :key, cipherPlainText = :plainText',
            ExpressionAttributeValues={
                ':key': key,
                ':plainText': plain_text
            }
        )
        return True
        
    except Exception as e:
        print(e)
        return False

def get_data_from_ddb(user_id):

    data = None
    try:

        response = USER_TABLE.get_item(Key={'userId': user_id})
        user = response.get('Item', None)
        
        if user is None:
            print("User not available in DDB. userId=" + user_id)
            return False, data

        else:
            data = { "key": user.get("cipherKey"), "plain_text": user.get("cipherPlainText") }

        return True, data
        
    except Exception as e:
        print(e)
        return False, data

# handler function to validate request payload based on the user's ACTION
# returns True and dict of desired values if payload is valid
# returnd False and list of errors if payload is invalid
def handle_req_payload(req_payload):
    ALLOWED_ACTIONS = ["SAVE", "CHECK"]
    errors = []
    data = {}
    
    action = req_payload.get("action", None)
    user_id = req_payload.get("userId", None)

    if action is None:
        errors.append("action is required")

    elif action.upper() not in ALLOWED_ACTIONS:
        errors.append("Invalid action: " + action)
        
    if user_id is None:
            errors.append("userId is required")
        
    if len(errors) > 0:
        return False, None, errors

    data = {}
    
    action = action.upper()
    if action == "SAVE":
        key = req_payload.get("key", None)
        plain_text = req_payload.get("plainText", None)
        
        if key is None:
            errors.append("key is required")
        
        if plain_text is None:
            errors.append("plainText is required")
            
        if len(errors) > 0:
            return False, None, errors

        else:
            data = { "action": action, "user_id": user_id, "key": key, "plain_text": plain_text }
    
    else:
        user_cipher = req_payload.get("cipher", None)

        if user_cipher is None:
            errors.append("cipher is required")
        
        if len(errors) > 0:
            return False, None, errors
        
        data = { "action": action, "user_id": user_id, "user_cipher": user_cipher }
        
    
    return True, data, []


# Code reference
# _______________________
# Title: Columnar transposition cipher
# Author: Y. Zafar
# Publication: GeeksforGeeks
# Published date: 30-Aug-2019
# Code version: v1
# Availabile: https://www.geeksforgeeks.org/columnar-transposition-cipher/
# Accessed: 04-Dec-2022

def encryptMessage(key, msg):
    cipher = ""
  
    # track key indices
    k_index = 0
  
    msg_len = float(len(msg))
    msg_lst = list(msg)
    key_lst = sorted(list(key))
  
    # calculate column of the matrix
    col = len(key)
      
    # calculate maximum row of the matrix
    row = int(math.ceil(msg_len / col))
  
    # add the padding character '_' in empty
    # the empty cell of the matrix 
    fill_null = int((row * col) - msg_len)
    msg_lst.extend('_' * fill_null)
  
    # create Matrix and insert message and 
    # padding characters row-wise 
    matrix = [msg_lst[i: i + col] 
              for i in range(0, len(msg_lst), col)]
  
    # read matrix column-wise using key
    for _ in range(col):
        curr_idx = key.index(key_lst[k_index])
        cipher += ''.join([row[curr_idx] 
                          for row in matrix])
        k_index += 1
  
    return cipher
