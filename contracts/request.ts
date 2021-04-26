import Menu from 'App/Models/Menu'
import Event from 'App/Models/Event'
import Nation from 'App/Models/Nation'
import Category from 'App/Models/Category'
import Location from 'App/Models/Location'
import MenuItem from 'App/Models/MenuItem'
import PushToken from 'App/Models/PushToken'
import OpeningHour from 'App/Models/OpeningHour'
import Subscription from 'App/Models/Subscription'

declare module '@ioc:Adonis/Core/Request' {
    interface RequestContract {
        menu?: Menu
        menuItem?: MenuItem
        nation?: Nation
        event?: Event
        category?: Category
        location?: Location
        openingHour?: OpeningHour
        pushToken?: PushToken
        subscription?: Subscription
    }
}
