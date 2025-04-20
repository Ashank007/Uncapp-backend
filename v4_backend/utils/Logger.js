import chalk from "chalk";

const logger = {
  debug: (...args) => console.log(chalk.magenta("[DEBUG]"), ...args),
  info: (...args) => console.log(chalk.blue("[INFO]"), ...args),
  success: (...args) => console.log(chalk.green("[SUCCESS]"), ...args),
  warn: (...args) => console.warn(chalk.yellow("[WARN]"), ...args),
  error: (...args) => console.error(chalk.red("[ERROR]"), ...args),
};

if (process.env.NODE_ENV === "production") {
  logger.debug = () => {};
  logger.info = () => {};
  logger.success = () => {};
  logger.warn = () => {};
}

const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    logger.debug("===== Incoming Request =====");
    logger.debug("Method:", req.method);
    logger.debug("URL:", req.originalUrl);
    logger.debug("Params:", req.params);
    logger.debug("Query:", req.query);
    logger.debug("Body:", req.body);
    logger.debug("============================");
  }

  next();
};

export default requestLogger;

