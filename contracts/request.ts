import Menu from 'App/Models/Menu'
import MenuItem from 'App/Models/MenuItem'
import Nation from 'App/Models/Nation'
import Event from 'App/Models/Event'
import Individual from 'App/Models/Individual'
import Category from 'App/Models/Category'
import Location from 'App/Models/Location'
import OpeningHour from 'App/Models/OpeningHour'

declare module '@ioc:Adonis/Core/Request' {
    interface RequestContract {
        menu?: Menu
        menuItem?: MenuItem
        nation?: Nation
        individual?: Individual
        event?: Event
        category?: Category
        location?: Location
        openingHour?: OpeningHour
    }
}
