const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

function base64ToGenerativePart(base64String, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(base64String, "base64").toString("base64"),
      mimeType,
    },
  };
}
app.get("/", (req, res) => {
  try {
    return res.json({
      chatbot: "Gemini Model Test Repo running successfully!!!!",
    });
  } catch (error) {
    console.log(error.message);
  }
});
app.post("/generate-content-from-image", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt =
      req.body.prompt || "What's different between these pictures?";

    const imageParts = req.body.images.map((image) =>
      base64ToGenerativePart(image.base64, image.mimeType)
    );

    const result = await model.generateContent([prompt, ...imageParts]);
    console.log({ result });
    const response = await result.response;
    const text = response.text();
    console.log({ text });
    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
