const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const fetch = require('node-fetch');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forecast.html'));
});

// Serve static files from the "public" directory
app.use(express.static("public"));

// Middleware
app.use(express.json()); // for parsing application/json

// MongoDB connection string
const mongoUrl = process.env.MONGODB_URI;

// Connect to MongoDB
// const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const client = new MongoClient(mongoUrl);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
  }
}

connectToDatabase();
//connect mongoDB via API
const atlasAPIEndpoint = 'https://us-east-2.aws.data.mongodb-api.com/app/data-atbre/endpoint/data/v1';
const atlasAPIKey = process.env.ATLAS_API_KEY;
const clusterName = 'INFSCI2560';

const dbName = "yourDatabaseName";
const weatherDB = "INFSCI2711";

const collectionName = "yourCollectionName";
const weatherDataCollection = "WeatherData";
const hourlyDataCollection = "WeatherData_Hourly";
const aprilDataCollection = "WeatherData_April";
const precipprobDataCollection = "WeatherData_Precip";

const headers = {
  "Content-Type": "application/json",
  "api-key": atlasAPIKey,
};

app.get("/data", async (req, res) => {
  const collection = client.db(dbName).collection(collectionName); // Make sure you have this line here
  try {
    const result = await collection.find().sort({ _id: -1 }).toArray();
    res.json(result); // Since limit(1) will return an array with one item
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//fetch weather from mongodb
app.get('/weather', async (req, res) => {
  const collection = client.db(weatherDB).collection(weatherDataCollection);

  // let query = {};
  // if (zipCode) {
  //   query["address"] = zipCode; // Filter by the ZIP code in the address field
  // }
  const zipCode = req.query.zip;
  
  const body = {
    dataSource: clusterName,
    database: weatherDB,
    collection: weatherDataCollection,
    filter: { "address": zipCode },
  };
  
  try {
    const endPointFunction = "/action/find";
    //call API
    const apiResponse = await fetch(atlasAPIEndpoint + endPointFunction, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const data = await apiResponse.json();
    
    res.status(200).send(data.documents); // Send the data to the client
    //add filter button
    //const result = await collection.find(query).toArray();
    //res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching data from Atlas API:", error);
    res.status(500).send("Error fetching data");
    // console.error('Error fetching from MongoDB:', error);
    // res.status(500).send(error.message);
  }
});

app.get('/sunset-sunrise-forecast', async (req, res) => {
  const zipCode = req.query.zip;
  //const times = await weatherService.getSevenDaysWeatherData(zipCode);

  const body = {
    dataSource: clusterName,
    database: weatherDB,
    collection: aprilDataCollection,
    filter: { "address": zipCode },
  };

  try {
    const endPointFunction = "/action/find";
    //call API
    const apiResponse = await fetch(atlasAPIEndpoint + endPointFunction, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const data = await apiResponse.json();
    //console.log(data.documents);
    res.status(200).send(data.documents);

  } catch (error) {
    console.error("Error fetching data from Atlas API:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get('/precipitation', async (req, res) => {
  
  const zipCode = req.query.zip;
  //console.log(zipCode);
  const headers ={
    "Content-Type": "application/json",
    "api-key": atlasAPIKey,
  };
  const body = {
    dataSource: clusterName,
    database: weatherDB,
    collection: weatherDataCollection,
    filter: { "address": zipCode },
  };  
  
 try {

   const endPointFunction = "/action/find";
   const apiResponse = await fetch(atlasAPIEndpoint + endPointFunction, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),  
   });
 
   const data = await apiResponse.json();
   //console.log("PREP: "+ data.documents);
   res.status(200).send(data.documents);
 
 } catch (error) {
    
   console.error("Error fetching data from Atlas API:", error);
   res.status(500).send("Error fetching data");   
 
 }  
});

// Q2: Precipitation probability
app.get('/precipprob', async (req, res) => {
  const zipCode = req.query.zip;
  const headers = {
    "Content-Type": "application/json",
    "api-key": atlasAPIKey,
  };
  const body = {
    dataSource: clusterName,
    database: weatherDB,
    collection: precipprobDataCollection,
    filter: { "Zipcode": zipCode.toString() },
  };

  try {

    const endPointFunction = "/action/find";
    const apiResponse = await fetch(atlasAPIEndpoint + endPointFunction, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json();
    //console.log("PREP: " + data.documents);
    res.status(200).send(data.documents);

  } catch (error) {

    console.error("Error fetching data from Atlas API:", error);
    res.status(500).send("Error fetching data");

  }
});

// For Q3: Meteors
app.get('/meteors', async (req, res) => {
  const headers = {
    "Content-Type": "application/json",
    "api-key": atlasAPIKey, // Securely managed API key
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Midnight of today
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3); // Midnight after three days

  // Construct a regex pattern to match the specific times in the datetime strings
  const timeRegex = /T(00:00:00|01:00:00|02:00:00|03:00:00|04:00:00|05:00:00|06:00:00)/;

  const body = {
    dataSource: clusterName,
    database: weatherDB,
    collection: "WeatherData_April_2",
    filter: {
      $and: [
        {
          datetime: {
            $gte: today.toISOString(),
            $lt: threeDaysLater.toISOString()
          }
        },
        { datetime: { $regex: timeRegex.source } }, // Use regex source for the pattern
        //{
          //cloudcover: { $lte: 80 }
        //},
        {
          $or: [
            {cloudcover: { $lte: 80 }},
            { visibility: { $gte: 10 } },
            { visibility: null }
          ]
        }
      ]
    }
  };

  try {
    const endPointFunction = "/action/find";
    const apiResponse = await fetch(atlasAPIEndpoint + endPointFunction, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json();
    res.send(data.documents);

  } catch (error) {
    console.error("Error fetching data from Atlas API:", error);
    res.status(500).send("Error fetching data");
  }
});



// Other routes and middleware...
app.get("/forecast", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "forecast.html"));
});

//#region not using functions
app.get("/api.data", async (req, res) => {
  const body = {
    dataSource: clusterName,
    database: dbName,
    collection: collectionName,
    filter: {}, // Modify if you want to filter the results
  };

  try {
    const endPointFunction = "/action/find";
    //call API
    const apiResponse = await fetch(atlasAPIEndpoint + endPointFunction, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const data = await apiResponse.json();
    res.send(data.documents); // Send the data to the client
  } catch (error) {
    console.error("Error fetching data from Atlas API:", error);
    res.status(500).send("Error fetching data");
  }
});
//#endregion

// Other routes and middleware...
app.get('/forecast', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forecast.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
