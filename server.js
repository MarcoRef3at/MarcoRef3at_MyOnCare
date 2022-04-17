const allowCrossDomain = require("./middleware/cors");
const cors = require("cors");
const colors = require("colors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const express = require("express");
const errorHandler = require("./middleware/error");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route Files
const routers = require("./routes");

const app = express();

// Body Parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("common"));
}

// Add CORS middleware
app.use(allowCrossDomain);
// Enable CORS
const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    // console.log("origin", origin);
    // if (whitelist.includes(origin))
    return callback(null, true);

    // callback(new Error('Not allowed by CORS'));
  }
};
app.use(cors(corsOptions));

// Set Security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 500 //500 requests per 10 minutes
});
app.use(limiter);

// Prevent Http param pollution
app.use(hpp());

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.green
  )
);

// Mount Routers
app.get("/", (req, res) => res.redirect(process.env.POSTMAN_COLLECTION));
routers(app);

app.use(errorHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
