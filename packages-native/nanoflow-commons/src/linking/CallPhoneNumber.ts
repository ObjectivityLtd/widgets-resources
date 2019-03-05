// This file was generated by Mendix Modeler.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the code between BEGIN USER CODE and END USER CODE
// Other code you write will be lost the next time you deploy the project.

import ReactNative from "react-native";

/**
 * @param {string} phoneNumber - This field is required.
 * @returns {string}
 */
function CallPhoneNumber(phoneNumber?: string): Promise<void> {
    // BEGIN USER CODE
    // Documentation https://facebook.github.io/react-native/docs/linking

    const Linking: typeof ReactNative.Linking = require("react-native").Linking;

    if (!phoneNumber) {
        throw new TypeError("Input parameter 'Phone number' is required");
    }

    phoneNumber = encodeURI(phoneNumber);

    return Linking.openURL(`tel:${phoneNumber}`);

    // END USER CODE
}