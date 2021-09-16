/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const getValidator = async (markup) => {
  const validator = await import(
    /* webpackChunkName: "validator-wasm" */
    'https://cdn.ampproject.org/v0/validator_wasm.js'
  )
    .then((module) => {
      console.log('module: ', { module });
      return module;
    })
    .catch((err) => {
      console.log('bummer ', err);
    });

  console.log({ validator });
  return validator().validateString(markup);
};

const onmessage = function (event, markup = '') {
  console.log('worker on message: ', { event, markup });

  const results = getValidator(markup);

  postMessage(results);
};

export default onmessage;
