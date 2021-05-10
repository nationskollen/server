/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
 */
import ExpoService from 'App/Services/Expo'
import { validator } from '@ioc:Adonis/Core/Validator'

/**
 * Creates a custom validation rule that verifies the format of an Expo push token.
 */
validator.rule('expoToken', (value, _, { pointer, arrayExpressionPointer, errorReporter }) => {
    /**
     * Skip validation when value is not a string. The string
     * schema rule will handle it
     */
    if (typeof value !== 'string') {
        return
    }

    /**
     * Report error when Expo token is not of a valid format
     */
    if (!value || !ExpoService.isValidToken(value)) {
        errorReporter.report(
            pointer,
            'expoToken',
            'Invalid format of Expo token',
            arrayExpressionPointer
        )
    }
})
