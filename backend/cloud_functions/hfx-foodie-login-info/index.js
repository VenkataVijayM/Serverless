const { FieldValue } = require('@google-cloud/firestore');
const Firestore = require('@google-cloud/firestore');

// Use your project ID here
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'hfx-foodie';
const COLLECTION_NAME = process.env.FIREBASE_COLLECTION_NAME || 'login-info';

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
      const {done, data} = await getAnswersFromDB(userId);

      if (!done) {
        res.status(500).send({errors: ['Internal server error']});
      } else {
        res.status(200).send(data);
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

      const success = await saveDataInDB(reqPayload) ? true : false;
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

  let message = req.query.message || req.body.message || 'Hello World!';
  res.status(200).send(message);
};

const getDataFromDB = async () => {
  let res = {
    done: false,
    data: []
  };

  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    snapshot.forEach((doc) => {
      res.data.push(doc.data());
    });
    res.done = true;
  } catch (error) {
    console.error(error);
  } finally {
    return res;
  }
};

const saveDataInDB = async (data) => {
  try {
    const docData = {
      loginAt: FieldValue.serverTimestamp(),
      ...data
    };

    await db.collection(COLLECTION_NAME).add(docData);
    return true;
  } catch(error) {
    console.error(error);
    return false;
  }
};
