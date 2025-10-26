/** @module amorCms  */
/**
 * @file AmorAbstractTransformer.js
 * @copyright (C) 2025 Danny Amor Joubolo danny.amor.joubolo@protonmail.com
 * @license Dual License Notice
 *
 * This software is licensed under the GNU Affero General Public License version 3 (AGPLv3) or later.
 * See the LICENSE.AGPL file for the full text.
 * If you wish to use this software under different terms, such as a commercial license that does not
 * require you to disclose modifications or source code (e.g., for proprietary use or internal development),
 * please contact danny.amor.joubolo@protonmail.com to discuss licensing options.
 * Commercial licenses are available for a fee and allow closed-source modifications and distribution.
 *
 * Copyright (C) 2025 Danny Amor Joubolo
 *
 *
 *
 */
import {AmorAbstractController, AmorAbstractAuthHandler, AmorError} from "@amor/amor-cms";
/**
 * The AmorAbstractTransformer is the class that interacts with third party-data
 * @class Class AmorAbstractTransformer
 * @classdesc  The AmorAbstractTransformer is the base class which needs to be extended in order to integrate data
 *              from other sources. The extending class must map the responses from third-party-APIs to 
 *              the JSON-schema of Amor-cms.
 * @hideconstructor
 *
 * @author Danny Amor Joubolo
 * @copyright (C) 2025 Danny Amor Joubolo danny.amor.joubolo@protonmail.com
 * @license GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007
 * 
 * <pre><code>
 *  The schema of the AmorModel is based on following simple mapping considerations:
 *  Its main component consists of two objects: the content-object and the mappings-object
 *  The content-object has integer counters as keys (let's call them amorIDs) and string-values. The mappings-object has
 *  string-keys (let's call them htmlIDs) that correspond to id-attributes that exist in the current DOM in which the
 *  AmorModel is used. The values of the mappings-object are integer-values which are taken from the keys of the
 *  content-object.
 *
 *  In other words there is a mapping htmlID => amorID:
 *  every htmlID is populated by the content-object via the amorID, or -in other words- the DOM is filled with the
 *  content of the AmorModel by referencing the mappings between elements of the DOM (those that possess
 *  an "id"-attribute) and the amorIDs.
 *
 *  More formally we can say that the Amor-schema is based on two simple key-value structures:
 *  - (amorID of type integer => amorValue of type string)
 *  - (htmlID of type string  => amorID of type integer or an [array of amorIDs])
 *
 *  So, there is a restriction that the mappings-object must have as its values necessarily only keys of the
 *  content-object.
 *
 *  To exploit this setting when data from third party APIs is required, we need to map the structure of the
 *  received third party data to the Amor schema, by specifying a mapping (of the third-party JSON-paths that we want
 *  to integrate) to the target Amor Schema.

 *      There are following -theoretical- options to integrate data from a third-party source of data {TP}:
 *  1. populate only the content-object with amorValue and amorID from {TP}
 *  2. populate only the content-object with amorValue from {TP} and assigning amorID to a counter
 *  3. populate only the mappings-object with htmlID and amorID from {TP}
 *  4. populate only the mappings-object with htmlID from {TP} and assigning amorID to a counter
 *  5. populate only the mappings-object with amorID from {TP} and assigning htmlID to some alphanumeric key
 *  6. populate both the content- and the mappings-object with htmlID, amorID and amorValue from {TP}
 *  7. populate both the content- and the mappings-object by assigning htmlID and amorValue data from {TP}, and
 *        amorID to a counter
 *  8. populate both the content- and the mappings-object by assigning amorID and amorValue data from {TP}, and
 *        htmlID to some alphanumeric key
 *  9. populate both the content- and the mappings-object by assigning amorValue data from {TP}, htmlID to some
 *        alphanumeric key and amorID to a counter
 *
 *  Seemingly some of the above options make no sense, like option 5. However this is not easy to confirm. AmorCms is a
 *  library to be used as a headless content management system, and most or even all of the described options might be
 *  useful in real-world situations because the visual component of the cms has to be adapted on very specific
 *  requirements. Amor-Cms is a library that helps in organizing the backend-data to facilitate such situations.
 *
 *  The AmorAbstractTransformer contains a static sample structure to play around:
 *
 *      AmorAbstractTransformer.sampleData = {
 *           data:
 *               [
 *                  {feed: {id: 1, title: "title1", url: "url1"}},
 *                  {feed: {id: 2, title: "title2", url: "url2"}},
 *                  {feed: {id: 3, title: "title3", url: "url3"}},
 *                  {feed: {id: 4, title: "title4", url: "url4"}},
 *                  {feed: {id: 5, title: "title5", url: "url5"}},
 *              ],
 *      }
 * </code></pre>
 *
 *
 * @author Danny Amor Joubolo
 * @copyright (C) 2025 Danny Amor Joubolo danny.amor.joubolo@protonmail.com
 * @license GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007
 *
 * @example
 *
 * export class MySampleTransformer extends AmorAbstractTransformer{
 *
 * const jsonDataObject = AmorAbstractTransformer.sampleData;
 * // In a real-world situation you will do, of course, something like below:
 * // Retrieve third party data from third party source TP = https://someApi.somewhere.com
 * // const jsonDataObject = doYourApiCall(your parameters{TP, apiKey, GET/POST and the like ...});
 *
 * populateModel(){
 *      //  Add data to the amor content-object with the retrieved data:
 *      //  Always keep in mind the signature of the doMappings()-method:
 *      //      doMappings(option, amorIDPath, htmlIDPath, amorValuePath)
 *
 *      // Fill the content-object with their original ids
 *      // Then associate some mappings to the DOM with other data with the same keys.
 *      // The Amor-Transformer will check automatically if the key and the value already exist in
 *      // the content object and either overwrite them or throw an error
 *      // depending on the setting of this.failFast
 *          this.doMappings(6,'data[*].feed.id', 'data[*].feed.id', 'data[*].feed.url', jsonDataObject);
 *      }
 * }
 *
 * Then in your application:
 *
 * <script type="module">
 import {AmorModel} from "@amor/amor-cms";
 const transformerConfig = {
                "AMOR_URL": "<your amor config url>",
                "returnDefaultIsoContentIfError": false,
                "controller": "<an Amor controller-type of your choice>",
                "debugSTEP": "",
                "debugLevel": 0,
                "sendLogData": false,
                "loadDefaultContent": false
            };
 window.amor = new AmorModel();
 window.amor.load(transformerConfig).then(() => {
                // Retrieve data from the source TP and populate the amor-model:
                const myTransformerObject=new MySampleTransformer(amor.getController(),amor.getAuthHandler());
                myTransformerObject.setFailFast(true);//throw error in case of problems in the data
                myTransformerObject.setOverwriteKeyValues(false);//do not overwrite existing key-value-pairs
                // Fill the data model:
                myTransformerObject.populateModel();
                // Now do something with the data:
                amor.data.mappings.forEach((htmlID,amorID)=>{
                    const div=document.createElement('div');
                    const tag=document.createElement('a');
                    const href=myTransformerObject.getController().getValue(amorID);
                    tag.setAttribute('id',htmlID);
                    tag.setAttribute('href',href);
                    tag.innerText="Click this link: "+href;
                    div.appendChild(tag);
                });

            });
 </script>
 *
 */
export class AmorAbstractTransformer {
    /**
     * Virtual constructor called when an Amor Transformer is instantiated.
     * @param {AmorAbstractController} controller - An instance of class AmorAbstractController.
     * @param {AmorAbstractAuthHandler} authHandler - An instance of class AmorAbstractAuthHandler.
     * @throws {AmorError} If `cms` is not the instance of an AmorModel
     * @constructs
     */
    constructor(controller, authHandler) {
        if (!(controller instanceof AmorAbstractController) || !(authHandler instanceof AmorAbstractAuthHandler)) {
            let controllerName = controller?.constructor?.name;
            let authHandlerName = authHandler?.constructor?.name;
            let msg;
            let msg1 = '';
            let msg2 = '';
            if (!(controller instanceof AmorAbstractController)) msg1 = "\ncontroller is not an instance of AmorAbstractController";
            if (!(authHandler instanceof AmorAbstractAuthHandler)) msg2 = "\nauthHandler is not an instance of AmorAbstractAuthHandler";
            if (this?.constructor?.name)
                msg = `${this.constructor.name}   with controller-type ${controllerName} and authHandler-type ${authHandlerName}${msg1}${msg2}`;
            else msg = ` AmorAbstractTransformer with controllerName: ${controllerName} and authHandlerName: ${authHandlerName}${msg1}${msg2}`;
            AmorError.throwNew(AmorError.info.CONSTRUCTOR_ERROR, [msg], AmorAbstractTransformer);
        }
        this.controller = controller;
        this.authHandler = authHandler;
        this.failFast = false;
        this.overwriteKeyValues = true;
        this.locale = this.controller.locale;
        this.definition = {
            STRING: "string",
            ARRAY_STRING: "array of strings",
            ARRAY_OBJECT: "array of objects",
            OBJECT: "object"
        }

    }

    setOverwriteKeyValues(bool) {
        this.overwriteKeyValues = bool;
    }


    static sampleData = {
        data:
            [
                {feed: {id: 1, title: "title1", url: "url1"}},
                {feed: {id: 2, title: "title2", url: "url2"}},
                {feed: {id: 3, title: "title3", url: "url3"}},
                {feed: {id: 4, title: "title4", url: "url4"}},
                {feed: {id: 5, title: "title5", url: "url5"}},
            ],
    }

   

    doMapping2(amorValuePath, sourceObject) {

    }

    doMapping6(amorIDPath, htmlIDPath, amorValuePath, sourceObject) {

    }

  

    doMappingMappings = async (objPathsForMappings, locale) => {
        Object.keys(objPathsForMappings).forEach(pathKey => {
            try {
                this.setMappedMappings(pathKey, this.controller.model["mappings"]);
            } catch (mappingError) {
                AmorError.throwNew(AmorError.info.TRANSFORMER_MAPPINGS_ERROR, [pathKey], AmorAbstractTransformer);
            }
        });
    }

    doAuthentication = async (authHandler, credentialsObj) => {
        const errObj = {};
        errObj.code = 10050;
        errObj.message = `Unallowed call to abstract method 'doAuthentication(authHandler,credentialsObj)' in AmorAbstractTransformer. Looks like the implementation of your transformer lacks this method.`
        errObj.throwingClass = AmorAbstractTransformer;
        throw new AmorError(errObj);
    }

    setMappedContent = async (pathKeyOfApiResponse, modelSubset) => {
        const errObj = {};
        errObj.code = 10100;
        errObj.message = `Unallowed call to abstract method 'setMappedContent(pathKeyOfApiResponse,modelSubset)' in AmorAbstractTransformer. Looks like the implementation of your transformer lacks this method.`
        errObj.throwingClass = AmorAbstractTransformer;
        throw new AmorError(errObj);
    }


    setMappedMappings = async (pathKeyOfApiResponse, mappingsSubset) => {
        const errObj = {};
        errObj.code = 10200;
        errObj.message = `Unallowed call to abstract method 'setMappedMappings(pathKeyOfApiResponse,mappingsSubset)' in AmorAbstractTransformer. Looks like the implementation of your transformer lacks this method.`
        errObj.throwingClass = AmorAbstractTransformer;
        throw new AmorError(errObj);
    }

    getData = async (apiPath, credentialsObj) => {
        const errObj = {};
        errObj.code = 10300;
        errObj.message = `Unallowed call to abstract method 'getData(apiPath,credentialsObj)' in AmorAbstractTransformer. Looks like the implementation of your transformer lacks this method.`
        errObj.throwingClass = AmorAbstractTransformer;
        throw new AmorError(errObj);
    }


    getController() {
        return this.controller;
    }
}
