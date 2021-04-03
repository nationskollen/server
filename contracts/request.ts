import Nation from 'App/Models/Nation'
import OpeningHour from 'App/Models/OpeningHour'

declare module '@ioc:Adonis/Core/Request' {
    interface RequestContract {
        nation?: Nation
        openingHour?: OpeningHour
    }
}
