import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
    public static needsApplication = true

    constructor(protected app: ApplicationContract) {}

    public register() {
        // Register your own bindings
    }

    public async boot() {
        // IoC container is ready
    }

    public async ready() {
        // Must import inline since the application is not ready
        // until this callback is executed.
        const App = await import('@ioc:Adonis/Core/Application')

        // Only import socket file, when environment is `web`. In other
        // words do not import during ace commands.
        if (App.default.environment === 'web') {
            await import('../start/socket')
        }
    }

    public async shutdown() {
        // Cleanup, since app is going down
    }
}
