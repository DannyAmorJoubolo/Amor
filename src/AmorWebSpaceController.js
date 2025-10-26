"use strict";
/** @module amorCustom  */
/**
 * @file AmorWebSpaceController.js
 * @copyright (C) 2025 Danny Amor Joubolo danny.amor.joubolo@protonmail.com
 */
import {AmorError, AmorAbstractController} from "@amor/amor-cms";
/**
 * The AmorWebSpaceController is the simplest controller-type of Amor-cms
 * @class AmorWebSpaceController
 * @augments AmorAbstractController
 * @classdesc
 *    The AmorWebSpaceController reads content-values from the web-space
 *    or web-server where the cms is hosted.
 *    It is a "readonly-"controller unable to write values to the hosting web-space. Its implemented doPersist-method
 *    only returns the content in a dummy fashion.
 *    It is up to the implementing page to implement how to upload to the web-space the new content. In the simplest
 *    setup, the users will simply upload the content -stored as JSON-file(s) adhering to the schema of Amor- manually
 *    to their web-space.
 *
 */
export class AmorWebSpaceController extends AmorAbstractController {
    /**
     * Constructs the instance of an AmorWebSpaceController.
     * @param {AmorModel} cms - An instance of class AmorModel.
     * @throws {AmorError} If `cms` is not the instance of an AmorModel
     */
    constructor(cms) {
        super(cms);
        this.___amorType = "AmorWebSpaceController";

    }

}
