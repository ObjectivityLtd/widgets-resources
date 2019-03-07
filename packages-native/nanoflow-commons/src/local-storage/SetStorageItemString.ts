// This file was generated by Mendix Modeler.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the code between BEGIN USER CODE and END USER CODE
// Other code you write will be lost the next time you deploy the project.

import ReactNative from "react-native";

/**
 * @param {string} key - This field is required.
 * @param {string} value - This field is required.
 * @returns {boolean}
 */
function SetStorageItemString(key?: string, value?: string): Promise<boolean> {
    // BEGIN USER CODE
    // Documentation https://facebook.github.io/react-native/docs/asyncstorage

    const AsyncStorage: typeof ReactNative.AsyncStorage = require("react-native").AsyncStorage;

    if (!key) {
        throw new TypeError("Input parameter 'Key' is required");
    }

    if (!value) {
        throw new TypeError("Input parameter 'Value' is required");
    }

    return AsyncStorage.setItem(key, value).then(() => true);

    // END USER CODE
}