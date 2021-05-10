declare module '@ioc:Adonis/Core/Validator' {
    import { Rule } from '@ioc:Adonis/Core/Validator'

    // Register custom validation rules
    export interface Rules {
        expoToken(): Rule
    }
}
