import Nation from 'App/Models/Nation'

declare module '@ioc:Adonis/Core/Request' {
    interface RequestContract {
        nation?: Nation
    }
}
