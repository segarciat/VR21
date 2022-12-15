require("dotenv").config();
const express = require("express");
const axios = require("axios");

const { WORDS_API_URL, WORDS_API_KEY } = process.env;

const PORT = 5000;

const app = express();

app.get("/api/words/:searchTerm", async (req, res) => {
  const { searchTerm } = req.params;
  try {
    const response = await axios(
      `${WORDS_API_URL}/${searchTerm}?key=${WORDS_API_KEY}`,
      { headers: { "Accept-Encoding": "gzip,deflate,compress" } }
    );

    // Transform response data.
    let matches = {};
    let suggestions = [];

    // Relevant suggestions found, but no results.
    if (response.data[0] && !response.data[0].meta) {
      suggestions = response.data;
    } else if (response.data[0]) {
      // Relevant suggestions found, as well as results.
      response.data.forEach((w) => {
        const result = w.meta.id.match(/[^:]+/)[0]; // match until :
        if (result === searchTerm) {
          // Match, with new part of speech (noun, verb, transitive verb, etc...)
          const wordData = matches[w.fl] || { id: w.meta.id, definitions: [] };
          wordData.definitions.push(...w.shortdef);
          matches[w.fl] = wordData;
        } else {
          suggestions.push(result);
        }
      });
    }
    res.status(200).json({ success: true, matches, suggestions });
  } catch (e) {
    res.status(500).json({ success: false, data: {} });
    console.log(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
