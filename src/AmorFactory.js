"use strict";
/** @module amorCms  */
/**
 * @file AmorFactory.js
 * @copyright (C) 2025 Danny Amor Joubolo danny.amor.joubolo@protonmail.com
 */
import {
    AmorAbstractController,
    AmorModel,
    AmorAuthHandler,
    SupabaseAuthHandler
} from "@amor/amor-cms";
import {
    AmorApiController,
    AmorWebSpaceController
} from "@amor/amor-custom";
import {createClient} from "@supabase/supabase-js";

/**
 * The factory class of Amor-cms
 * @class Class AmorFactory
 * @classdesc The factory of Amor-cms has the task of creating the necessary controllers, transformers and authHandlers
 *              of the application(s) being developed with Amor-cms. The Amor factory-class is a static class and 
 *              cannot be instantiated. Use AmorFactory.createXXX(args) to create the components of your applications.
 * @hideconstructor
 *
 * @author Danny Amor Joubolo
 * @copyright (C) 2025 Danny Amor Joubolo danny.amor.joubolo@protonmail.com
 * @license GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007
 */
export class AmorFactory {
    /**
     * Virtual constructor of the AmorFactory.
     */
    constructor() {
        throw new AmorError("The Amor factory-class is a static class and cannot be instantiated. Use AmorFactory.createXXX(args).  ");
    }

    /**
     * Creates a controller based on the provided parameters.
     * @param {string} controllerName - The type-name (or a synonym) of the controller to be created
     * @param {AmorModel} cms - an instance of type AmorModel
     * @returns {AmorAbstractController} an instance of type controllerName
     * @throws {AmorError} If the passed parameter cms is not an AmorModel or the  controller could not be created
     */
    static createController = (controllerName, cms) => {
        if (!(cms instanceof AmorModel)) {
            throw new AmorError("Constructor argument is not a Amor object.");
        }

        let controller = null;
        switch (controllerName) {
            case "Api":
            case "AmorApiController":
                controller = new AmorApiController(cms);
                break;
            case "WebSpace":
            case "AmorWebSpaceController":
                controller = new AmorWebSpaceController(cms);
                break;
            default:
                throw new AmorError(`Unknown controller name: ${controllerName}`);
        }
        if (controller && controller instanceof AmorAbstractController) {
            controller.runPostConstruct();
            return controller;
        } else throw new AmorError(`Controller-creation failed. Controller name: ${controllerName}`);

    }

    /**
     * Creates an authHandler  based on the provided parameters.
     * @param {string} authHandlerName - The type-name (or a synonym) of the authentication-handler to be created
     * @param {AmorAbstractController} controller - an instance of an Amor controller
     * @returns {AmorAbstractAuthHandler} an instance of type authHandlerName
     * @throws {AmorError} If the passed controller is not of type AmorAbstractController or the authHandler could not be created
     */
    static createAuthHandler = (authHandlerName, controller) => {
        if (!(controller instanceof AmorAbstractController)) {
            throw new AmorError("Constructor argument is not a controller.");
        }
        if (!(controller.cms instanceof AmorModel)) {
            throw new AmorError("Constructor argument is not a controller with an Amor-object as attribute.");
        }

        switch (authHandlerName) {
            case "Standard":
            case "Amor":
            case "AmorAuthHandler":
                return new AmorAuthHandler(controller);
            case "supabase":
                const supabase = createClient(controller.cms.config["supabaseUrl"], controller.cms.config["supabaseKey"]);
                return new SupabaseAuthHandler(controller, supabase);
            default:
                throw new AmorError(`Unknown authHandlerName : ${authHandlerName}`);
        }
    }

}


/**
 * The AmorError-class
 * @class AmorError
 * @classdesc The base class to catch, handle and document Amor-Errors
 *
 * */
export class AmorError extends Error {
    // Shared fallback bus if no instance is provided
    static sharedBus = new EventTarget();
    
    constructor(errorInput, error) {
        

    }

    // Convenience method to attach a listener to the shared fallback bus
    static onShared(listener) {
        AmorError.sharedBus.addEventListener("AMOR_ERROR", listener);
    }
}

