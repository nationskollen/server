import Menu from 'App/Models/Menu'
import MenuItem from 'App/Models/MenuItem'
import Nation from 'App/Models/Nation'
import Event from 'App/Models/Event'
import Location from 'App/Models/Location'
import OpeningHour from 'App/Models/OpeningHour'

declare module '@ioc:Adonis/Core/Request' {
    interface RequestContract {
        menu?: Menu
        menuItem?: MenuItem
        nation?: Nation
        event?: Event
        location?: Location
        openingHour?: OpeningHour
    }
}
