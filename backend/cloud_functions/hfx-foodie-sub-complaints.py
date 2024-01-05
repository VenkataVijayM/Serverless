#Title - hfx-foodie-sub-complaints
#Author - Venkata Vijaya Mandapati
#Description - This file is subsciber of customer_complaints topic that is responsibel for creating chatroom by storing details in firestore
#References - 
# 1 - https://cloud.google.com/run/docs/triggering/pubsub-push

import base64
import json
from google.cloud import firestore
from datetime import datetime

def hello_pubsub(event, context):

  pubsub_message = base64.b64decode(event['data']).decode('utf-8')
  message = json.loads(pubsub_message)
  print(message)
  customerId = message["customerId"]
  restaurantId = message["restaurantId"]
  orderId = message["orderId"]

  db = firestore.Client()
  doc_ref = db.collection(u'chat_complaints').document(orderId)
  doc_ref.set({
    u'isResolved' : 'false',
    u'customerId': customerId,
    u'restaurantId': restaurantId,
    u'orderId': orderId
  })