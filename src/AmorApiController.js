"use strict";
/** @module amorCustom  */
/**
 * @file AmorApiController.js
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
import {AmorError, AmorAbstractController, AmorAbstractTransformer} from "@amor/amor-cms";

/**
 * The AmorApiController is a simple controller-type of Amor-cms that allows basic UI-functionalities to update content
 * @class Class AmorApiController
 * @author Danny Amor Joubolo
 * @license GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007
 * @augments AmorAbstractController
 * @hideconstructor 
 * @classdesc
 *    The AmorApiController is able to read and write content-values from and to the backend.
 *    It interacts with the specific backend of the configured cms, typically with a REST-api.
 *
 */
export class AmorApiController extends AmorAbstractController {
    /**
     * Constructs the instance of an AmorApiController.
     * @constructs
     * @param {AmorModel} cms - An instance of class AmorModel.
     * @throws {AmorError} If `cms` is not the instance of an AmorModel
     */
    constructor(cms) {
        super(cms);
   

    }


   
}

