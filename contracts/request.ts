import Menu from 'App/Models/Menu'
import MenuItem from 'App/Models/MenuItem'
import Nation from 'App/Models/Nation'
import Event from 'App/Models/Event'
import Person from 'App/Models/Person'
import Category from 'App/Models/Category'
import Location from 'App/Models/Location'
import OpeningHour from 'App/Models/OpeningHour'

declare module '@ioc:Adonis/Core/Request' {
    interface RequestContract {
        menu?: Menu
        menuItem?: MenuItem
        nation?: Nation
        person?: Person
        event?: Event
        category?: Category
        location?: Location
        openingHour?: OpeningHour
    }
}
