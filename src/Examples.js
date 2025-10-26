"use strict";
/** @module amorCustom  */
/**
 * @file Examples.js
 * @copyright (C) 2025 Danny Amor Joubolo danny.amor.joubolo@protonmail.com
 */
import {AmorModel, AmorError, AmorAbstractTransformer} from "@amor/amor-cms";

/**
 * An example Transformer
 * @class Class ExampleTransformer
 * @classdesc This class gets some public demo data from the AlphaVantage API and the static Sample data, of the
 *              AmorAbstractTransformer-class. Ith then fills the Amor - Model with these data and creates some simple
 *              html with it.
 * @hideconstructor
 */
class ExampleTransformer extends AmorAbstractTransformer {
    constructor(controller, authHandler) {
        super(controller, authHandler);
        this.demoChoice = 1;//default

        this.dataSource = {};
        this.dataSource.amor = AmorAbstractTransformer.sampleData;
        this.dataSource.alphaVantage = {};
        this.dataSource.alphaVantage.url1 = "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=COIN,CRYPTO:BTC,FOREX:USD&time_from=20220410T0130&limit=1000&apikey=demo";
        this.dataSource.alphaVantage.url2 = "https://www.alphavantage.co/query?function=SMA&symbol=USDEUR&interval=weekly&time_period=10&series_type=open&apikey=demo";
    }

    async setData(data) {
        let d;
        if (typeof data === "object")
            d = data;
        else {
            const json = await this.fetchContent(data);
            if (json === null) {
                AmorError.throwNew(`Failed to fetch content from ${data}`);
            }
            d = JSON.parse(json);
        }
        this.data = d;
        //Show the input data
        this.getController().cinf("::::::::::::::: Input data of MySampleTransformer: ", this.data);
    }

    getData() {
        return this.data;
    }

    setDemo(choice) {
        this.demoChoice = choice;
    }

    getDemo() {
        return this.demoChoice;
    }

    async populate() {
        if (this.demoChoice === 1) {
            await this.setData(this.dataSource.amor);
            await this.doMappings(9, null, null, 'data[*].feed.url', this.data);
        } else if (this.demoChoice === 2) {
            await this.setData(this.dataSource.alphaVantage.url1)
            await this.doMappings(6, 'feed[*].title', 'feed[*].title', 'feed[*].url', this.data);
        } else if (this.demoChoice === 3) {
            await this.setData(this.dataSource.alphaVantage.url1)
            await this.doMappings(9, null, null, 'feed[*].url', this.data);
        } else if (this.demoChoice === 4) {
            await this.setData(this.dataSource.alphaVantage.url1)
            await this.doMappings(7, null, 'feed[*].title', 'feed[*].url', this.data);
        } else if (this.demoChoice === 5 ||this.demoChoice === 6) {
            await this.setData(this.dataSource.alphaVantage.url2);
            await this.doMappings(7, null, '', 'SMA', this.data);
        }
    }
}

const transformerConfig = {
    "AMOR_URL": ".",
    "returnDefaultIsoContentIfError": false,
    "controller": "AmorWebSpaceController",
    "debugSTEP": "EXTRACT_KEY_VALUES",
    "debugLevel": 4,
    "sendLogData": false,
    "loadDefaultContent": false
};
window.amor = new AmorModel();


let mainDiv = document.getElementById("main");
if (!mainDiv) {
    mainDiv = document.createElement("div");
    mainDiv.setAttribute("id", "main");
}

await window.amor.load(transformerConfig);
console.log("<<<<<<<<<<<< Initial amor-object:", window.amor);
// Retrieve data from the source TP and populate the amor-model:
const myTransformerObject = new ExampleTransformer(window.amor.getController(), window.amor.getAuthHandler());


myTransformerObject.setDemo(6);
myTransformerObject.setFailFast(false);// do not throw error in case of problems in the data
myTransformerObject.setOverwriteKeyValues(true);// overwrite existing key-value-pairs
myTransformerObject.getController().setFailFast(true); // throw error in case of problems in model
// Fill the data model:
await myTransformerObject.populate();
console.log("<<<<<<<<<<<<< Transformed amor object ", window.amor);
// Now do something with the data:
let countRow = 0;
if (myTransformerObject.getDemo() === 5 || myTransformerObject.getDemo() === 6) {
    const h2 = document.createElement('h2');
    h2.innerText = "SMA-value of USD/EUR";
    mainDiv.appendChild(h2);
    Object.keys(window.amor.data["mappings"]).forEach(htmlID => {
        const div = document.createElement('div');
        div.setAttribute("style", "border: 1px dotted black; padding: 10px; background-color: #f0f0f0;");
        const tag = document.createElement('p');
        const amorID = window.amor.data["mappings"][htmlID];
        myTransformerObject.getController().getValue(amorID).then(SMA => {
            countRow++;
            if (myTransformerObject.getDemo() === 6) tag.setAttribute('id', htmlID);
            else tag.innerText = `${htmlID.slice(2)}: ${SMA}`;
            div.appendChild(tag);
            mainDiv.appendChild(div);
        });
    });
} else {
    Object.keys(window.amor.data["mappings"]).forEach(htmlID => {
        const div = document.createElement('div');
        div.setAttribute("style", "border: 1px dotted black; padding: 10px; background-color: #f0f0f0;");
        const tag = document.createElement('a');
        const amorID = window.amor.data["mappings"][htmlID];
        myTransformerObject.getController().getValue(amorID).then(href => {
            countRow++;
            tag.setAttribute('id', htmlID);
            tag.setAttribute('href', href);
            tag.setAttribute('target', 'new');
            //tag.innerText = `${countRow} - Click this link:  ${href}`;
            div.appendChild(tag);
            mainDiv.appendChild(div);
        });
    });
}

//Set the rendered content to be editable
window.amor.editMode=window.amor.editModes.EDIT_CMS_INSTANCE;
await window.amor.setContent();
