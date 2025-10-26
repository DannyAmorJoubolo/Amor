"use strict";
/** @module amorCms  */
/**
 * @file AmorModel.js
 * @copyright (C) 2025 Danny Amor Joubolo danny.amor.joubolo@protonmail.com
 */
import {
    AmorFactory,
    AmorError,
    AmorAbstractController
} from "@amor/amor-cms";
import {
    AmorApiController,
    AmorWebSpaceController
} from "@amor/amor-custom";

/**
 * The AmorModel is the class that contains and governs the content-data of the respective cms
 * @class Class AmorModel
 * @augments EventTarget
 * @classdesc The AmorModel loads the configuration of the cms. It then interacts with the configured Amor-controller
 * which is responsible to read and write data from the model in a model/view-paradigm. It also loads an
 * Authentication-handler. It uses events its own events-enum 'amorStatus' to update the model. @see AmorModel#amorStatus
 * @hideconstructor
 *
 * @author Danny Amor Joubolo
 * @copyright (C) 2025 Danny Amor Joubolo danny.amor.joubolo@protonmail.com
 * @license GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007
 */
export class AmorModel extends EventTarget {
    /**
     * Constructs the instance of an AmorModel.
     * @constructs
     */
    constructor() {
        super();
        /**
         * Identifies the type of the model.
         * @type {string}
         */
        this.___type = "AmorModel";
        /**
         * Represents the states of the load-process.
		 * @readonly
         * @enum {boolean}
         */
        this.amorStatus = {
            /**
             * Indicates whether languages have been loaded.
             * @type {boolean}
             */
            LANGUAGES_LOADED: false,

            /**
             * Indicates whether the configuration has been loaded.
             * @type {boolean}
             */
            CONFIG_LOADED: false,

            /**
             * Indicates whether the content has been loaded.
             * @type {boolean}
             */
            CONTENT_LOADED: false,

            /**
             * Indicates whether mappings have been loaded.
             * @type {boolean}
             */
            MAPPINGS_LOADED: false,

            /**
             * Indicates whether the content has been processed.
             * @type {boolean}
             */
            CONTENT_PROCESSED: false
        };

        /**
         * Edit modes for the model.
         * @enum {string}
         */
        this.editModes = {
            /**
             * Edit mode for CMS instance.
             * @type {string}
             */
            EDIT_CMS_INSTANCE: "editCms",

            /**
             * Edit mode for CMS page.
             * @type {string}
             */
            EDIT_CMS_PAGE: "editCmsPage",

            /**
             * No edit mode (read-only).
             * @type {string}
             */
            EDIT_NONE: "readOnly"
        };

        /**
         * Current edit mode of the model.
         * @type {string}
         */
        this.editMode = this.editModes.EDIT_NONE;

        /**
         * Event types used by the model.
         * @enum {string}
         */
        this.amorEvents = {
            /**
             * Event fired when languages are loaded.
             * @type {string}
             */
            LANGUAGES_LOADED: "languages_loaded",

            /**
             * Event fired when the configuration is loaded.
             * @type {string}
             */
            CONFIG_LOADED: "config_loaded",

            /**
             * Event fired when content is loaded.
             * @type {string}
             */
            CONTENT_LOADED: "content_loaded",

            /**
             * Event fired when mappings are loaded.
             * @type {string}
             */
            MAPPINGS_LOADED: "mappings_loaded",

            /**
             * Event fired when content is updated.
             * @type {string}
             */
            CONTENT_UPDATED: "mappings_updated",

            /**
             * Event fired when the context menu changes.
             * @type {string}
             */
            CONTEXT_MENU_CHANGED: "contextmenu_changed"
        };

        this.defaultScrollSettings = {
            behaviour: AmorModel.SCROLL_SETTINGS.behaviour.smooth,
            block: AmorModel.SCROLL_SETTINGS.block.end,
            inline: AmorModel.SCROLL_SETTINGS.inline.nearest
        }
        this.isInitialized = false;


        this.authHandler = null; // Dependency injection for flexibility (e.g., Supabase, custom, etc.)
        this.controller = null;

        this.savedAMORID = undefined;
        this.savedFlag = false


        this.returnDefaultIsoContentIfError = false;
        this.highLightedElements = [];
        this.config = {};
        this.data = {};
        this.data.other = {};
        this.data.other.copyrightInfo = AmorModel.COPYRIGHT_INFO;

        this.data.currentPage = {};
        this.data.currentPage.___type = "this.data.currentPage";
        this.currentPage = null;
        this.data.supportedLanguages = [];
        this.data.supportedLanguages.___type = "supportedLanguages";

        this.initializing = true;
        this.suppressDebug = false;
        this.debugLevel = 1;
        this.addListeners().then(() => {
            console.info("Listeners have been added to amor model");
        });


    }

    /**
     * Path to the default configuration file. This constant will be used only as fallback, if the load of the
     * config-object in AmorModel.load(config) fails for some reason.
     * @static
     * @type {string}
     */
    static CONFIG_FILE_PATH = './amor/amorConfig.json';
    static CURRENT_DEBUG_LEVEL = 2;
    static COPYRIGHT_INFO = ` * # Dual License Notice
	 *
	 * Amor-cms and the JSON-schema of the underlying model are licensed under the GNU Affero General Public License 
	 * version 3 (AGPLv3) or later.
	 * See the LICENSE.AGPL file for the full text.
	 * If you wish to use this software under different terms, such as a commercial license that does not
	 * require you to disclose modifications or source code (e.g., for proprietary use or internal development),
	 * please contact danny.amor.joubolo@protonmail.com to discuss licensing options.
	 * Commercial licenses are available for a fee and allow closed-source modifications and distribution.
	 *
	 * Copyright (C) 2025 Danny Amor Joubolo`;

    /**
     * convenience enum to read values for scroll behaviour when
     * using function scrollIntoView()
     * @enum {string}
     */
    static SCROLL_SETTINGS = {
        behaviour: {
            smooth: "smooth",
            auto: "auto",
            instant: "instant"
        },
        block: {
            start: "start",
            center: "center",
            end: "end",
            nearest: "nearest"
        },
        inline: {
            start: "start",
            center: "center",
            end: "end",
            nearest: "nearest"
        }, container: {
            all: "all",
            nearest: "nearest"
        }
    };

    static GLOBAL_DEBUG = {
        CTX_MENU: "CTX_MENU",
        FEATURE1: "FEATURE1"
    };

      

    getController() {
        return this.controller;
    }

    async setController() {
        this.controller = AmorFactory.createController(this.config.controller, this);
       console.info("::: Controller has been set ::: Type:", this.getController().constructor.name);
    }

    getAuthHandler() {
        return this.authHandler;
    }

    async setAuthHandler() {
        if (this.config.hasOwnProperty("authHandler")) {
            this.authHandler = AmorFactory.createAuthHandler(this.config.authHandler, this.getController());
        } else {
            this.authHandler = AmorFactory.createAuthHandler("AmorAuthHandler", this.getController());
        }
    }

    async addListeners() {
      
    }


    /**
     * Starts the load process based on the provided configuration.
     * This method does not return a value. Instead, it dispatches events with the outcome of the load process.
     * @param {string|object} config - Either a string with the path to a JSON configuration file,
     *                                 or a configuration object. If neither is provided, a fallback process
     *                                 will attempt to load the configuration from the default file at
     *                                 `AmorModel.CONFIG_FILE_PATH`.
     *
     * @fires AmorModel#CONFIG_LOADED
     * Dispatched when the configuration is successfully loaded.
     * The event object contains a `detail` property with the loaded configuration data.
     * Calls {@link AmorModel#loadContent} when the config load process completed successfully.
     * {@link AmorModel#loadContent} will then dispatch another event when the model has been populated with data by the
     * configured controller.
     * The dispatched event of {@link AmorModel#loadContent}  contains  information about the final status of the
     * load-processing.
     * {@link AmorModel#loadContent} will be called only if the configuration has set `loadDefaultContent` to `true`.
     * Otherwise an empty model is created, which can be adapted to the specific use case.
     *
     * @throws {AmorError} If the configuration load fails.
     */
    async load(config) {
   
    }



    /**
     * Loads the initial content at startup based on the used controller and fills the model with the retrieved data.
     * This method does not return a value. Instead, it dispatches a `CONTENT_LOADED` event with the status at the end 
     * of the load process.
     *
     * @fires AmorModel#CONTENT_LOADED
     * Dispatched when the content is successfully loaded.
     * The event object contains a `detail` property with the loaded data of the AmorModel.
     * The model is populated by the configured controller instance with a call to
     * {@link AmorAbstractController#populateModel()}
     * {@link AmorModel#loadContent} will be called only if the configuration has set `loadDefaultContent` to `true`.
     * Otherwise no call to {@link AmorAbstractController#populateModel()} takes place and an empty model is created,
     * which can be then populated later, adapting the flow to the specific use case.
     * @throws {AmorError} If the content could not be loaded or, in other words, the model was not populated with data.
     */
    async loadContent() {

    }


    async setContentByArray(key, arrayValues) {

    }


    async setContentByTag(key, id) {

    }

    async setContent() {

    }


    switchLocale(iso) {
 
    }


    async registerUser(fullName, email, password) {
 
    }

    async loginUser(email, password) {
 
    }


}

/**
 * The AmorAbstractAuthHandler is the abstract base class for registration and authentication in Amor-cms
 * @class AmorAbstractAuthHandler
 * @classdesc The base abstract class to handle  authentication and registration.  All Amor-Auth-handler classes must
 * extend this abstract class
 *
 * */
export class AmorAbstractAuthHandler {
    constructor(controller) {
        if (!(controller instanceof AmorAbstractController)) {
            let constructorName = controller?.constructor?.name;
            AmorError.throwNew(AmorError.info.CONSTRUCTOR_ERROR, [constructorName], AmorAbstractAuthHandler);
        }
        this.controller = controller;
    }
}


/**
 * The AmorAuthHandler is the simplest auth-handler-type of Amor-cms
 * @class AmorAuthHandler
 * @classdesc The base class to handle  authentication and registration. It does not require third-party integrations
 *
 * */
export class AmorAuthHandler extends AmorAbstractAuthHandler {
    constructor(controller) {
        super(controller);
    }

  

}

/**
 * The SupabaseAuthHandler is the simplest auth-handler-type of Amor-cms
 * @class SupabaseAuthHandler
 * @classdesc SupabaseAuthHandler class to handle  authentication and registration, using the Supabase-infrastructure
 *
 */
export class SupabaseAuthHandler extends AmorAbstractAuthHandler {
    constructor(controller, supabaseClient) {
        super(controller);
        this.supabase = supabaseClient;
    }

    async registerUser(email, fullName, password) {
        return await this.supabase.auth.signUp({
            email,
            password,
            options: {data: {full_name: fullName}}
        });
    }

    async authenticateUser(email, password) {
        const crdObj = {};
        const response = await this.supabase.auth.signInWithPassword({email, password});
        //TODO check supabase api how to get response codes
        if (response) {
            crdObj.status = 200;
            crdObj.supaBaseResponse = response;
        } else {
            crdObj.status = 401;
        }
        return crdObj;
    }
}

