const Firestore = require('@google-cloud/firestore');

// Use your project ID here
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || null;
const COLLECTION_NAME = process.env.FIREBASE_COLLECTION_NAME || null;

const db = new Firestore({
  projectId: PROJECT_ID,
  timestampsInSnapshots: true
});

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.requestHandlerFunc = async (req, res) => {

  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  const method = req.method;
  switch(method) {
    case "GET":

      const { errors, data: queryParams } = handleQueryParams(req.query);

      if (errors.length > 0) {
        res.status(400).send({errors});
      }
      
      const { userId, answer1, answer2, answer3 } = queryParams;
      
      let matched = false;
      const {done, userData} = await getAnswersFromDB(userId);

      if (!done) {
        res.status(500).send({errors: ['Internal server error']});
      }

      if (userData != null) {
        const { answer1: dbAnswer1, answer2: dbAnswer2, answer3: dbAnswer3 } = userData;
        matched = (answer1 == dbAnswer1 && answer2 == dbAnswer2 && answer3 == dbAnswer3);
        res.status(200).send(matched);
      } else {
        res.status(404).send({errors: [`User not found. userId: ${userId} is invalid`]});
      }

      break;

    case "POST":
      const reqPayload = req.body;

      const uId = reqPayload.userId;

      if (uId == undefined) {
        res.status(400).send({errors: ["userId is required"]});
      } else if (uId.trim() == "") {
        res.status(400).send({errors: ["userId cannot be empty"]});
      }

      const success = await saveAnswersInDB(reqPayload) ? true : false;

      if (success) {
        res.status(200).send(true);
      } else {
        res.status(500).send({errors: [`Internal server error. Failed to save answers in DB`]});
      }
      break;
    default:
      res.status(405).send({errors: [`Method ${method} not allowed`]});
      break;
  }
};

const handleQueryParams = (queryParams) => {
  const res = {
    errors: [],
    data: {
      userId: queryParams.userId,
      answer1: queryParams.answer1,
      answer2: queryParams.answer2,
      answer3: queryParams.answer3
    }
  }

  if (Object.keys(queryParams).length === 0) {
    res.errors.push("No query params found. userId, answer1, answer2, answer3 are required");
    return res;
  }

  for (const key in res.data) {
    if (Object.hasOwnProperty.call(res.data, key)) {
      const val = res.data[key];
      if (val == undefined) {
        res.errors.push(`${key} is required`);
      } else if (val.trim() == "") {
        res.errors.push(`${key} is blank`);
      }
    }
  }

  return res;
}

const getAnswersFromDB = async (userId) => {
  let res = {
    done: false,
    userData: null
  };
  try {
    const doc = await db.collection(COLLECTION_NAME).doc(userId).get();

    res.done = true;
    res.userData = doc.exists ? doc.data() : null;
 
    return res;
  } catch(error) {
    console.error(error);
    return res;
  }
};

const saveAnswersInDB = async (data) => {
  try {
    await db.collection(COLLECTION_NAME).doc(data.userId).set(data);
    return true;
  } catch(error) {
    console.error(error);
    return false;
  }
};
