/// <reference types="cypress" />

import codeCoverageTask from "@cypress/code-coverage/task";
import { percyHealthCheck } from "@percy/cypress/task";
import axios from "axios";
import Promise from "bluebird";
import dotenv from "dotenv";
import * as fs from "fs";
import _ from "lodash";
import * as path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const browserify = require('@cypress/browserify-preprocessor');
const cucumber = require('cypress-cucumber-preprocessor').default;
const resolve = require('resolve');

const gmail_tester = require("gmail-tester");

dotenv.config({ path: ".env.local" });
dotenv.config();

const awsConfig = require(path.join(__dirname, "../../aws-exports-es5.js"));

const plugins = (on, config) => {
  config.env.defaultPassword = process.env.SEED_DEFAULT_USER_PASSWORD;
  config.env.paginationPageSize = process.env.PAGINATION_PAGE_SIZE;
  // Auth0
  config.env.auth0_username = process.env.AUTH0_USERNAME;
  config.env.auth0_password = process.env.AUTH0_PASSWORD;
  config.env.auth0_domain = process.env.REACT_APP_AUTH0_DOMAIN;
  config.env.auth0_audience = process.env.REACT_APP_AUTH0_AUDIENCE;
  config.env.auth0_scope = process.env.REACT_APP_AUTH0_SCOPE;
  config.env.auth0_client_id = process.env.REACT_APP_AUTH0_CLIENTID;
  config.env.auth0_client_secret = process.env.AUTH0_CLIENT_SECRET;
  config.env.auth_token_name = process.env.REACT_APP_AUTH_TOKEN_NAME;
  // Okta
  config.env.okta_username = process.env.OKTA_USERNAME;
  config.env.okta_password = process.env.OKTA_PASSWORD;
  config.env.okta_domain = process.env.REACT_APP_OKTA_DOMAIN;
  config.env.okta_client_id = process.env.REACT_APP_OKTA_CLIENTID;

  // Amazon Cognito
  config.env.cognito_username = process.env.AWS_COGNITO_USERNAME;
  config.env.cognito_password = process.env.AWS_COGNITO_PASSWORD;
  config.env.awsConfig = awsConfig.default;

  // Google
  config.env.googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  config.env.googleClientId = process.env.REACT_APP_GOOGLE_CLIENTID;
  config.env.googleClientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

  const testDataApiEndpoint = `${config.env.apiUrl}/testData`;

  const queryDatabase = ({ entity, query }, callback) => {
    const fetchData = async (attrs) => {
      const { data } = await axios.get(`${testDataApiEndpoint}/${entity}`);
      return callback(data, attrs);
    };

    return Array.isArray(query) ? Promise.map(query, fetchData) : fetchData(query);
  };

  on("task", {
    percyHealthCheck,
    async "db:seed"() {
      // seed database with test data
      const { data } = await axios.post(`${testDataApiEndpoint}/seed`);
      return data;
    },

    // fetch test data from a database (MySQL, PostgreSQL, etc...)
    "filter:database"(queryPayload) {
      return queryDatabase(queryPayload, (data, attrs) => _.filter(data.results, attrs));
    },
    "find:database"(queryPayload) {
      return queryDatabase(queryPayload, (data, attrs) => _.find(data.results, attrs));
    },

    async "gmail:get-messages"(args) {
      const messages = await gmail_tester.check_inbox(
        path.resolve(__dirname, "credentials.json"),
        path.resolve(__dirname, "token.json"),
        args.options
      );
      return messages;
    },

    "compareSnapshots"(args) {
      const { specName, width, height } = args;
      const screenshotsPath = path.resolve(__dirname, `../screenshots/${specName}`);

      const oldImage = path.resolve(screenshotsPath, `old_${width}x${height}.png`);
      const actualImage = path.resolve(screenshotsPath, `actual_${width}x${height}.png`);
      const diffImage = path.resolve(screenshotsPath, `diff_${width}x${height}.png`)

      if (!fs.existsSync(oldImage)) {
        fs.copyFileSync(actualImage, oldImage);
      }
      const img1 = PNG.sync.read(
        fs.readFileSync(oldImage)
      );
      const img2 = PNG.sync.read(fs.readFileSync(actualImage));
      const diff = new PNG({ width: img1.width, height: img1.height });

      const result = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {})
      if (result) {
        fs.writeFileSync(
          diffImage,
          PNG.sync.write(diff)
        );
      }
      return result;
    }
  });

  codeCoverageTask(on, config);

  const options = {
    ...browserify.defaultOptions,
    typescript: resolve.sync('typescript', { baseDir: config.projectRoot }),
  };


  on('file:preprocessor', cucumber(options));

  on('after:screenshot', ({ path }) => {
    fs.renameSync(path, path.replace(/ \(\d*\)/i, ''));
  });

  return config;
};

export default plugins;
