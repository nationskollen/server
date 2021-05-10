import Menu from 'App/Models/Menu'
import Event from 'App/Models/Event'
import Nation from 'App/Models/Nation'
import Category from 'App/Models/Category'
import Location from 'App/Models/Location'
import MenuItem from 'App/Models/MenuItem'
import PushToken from 'App/Models/PushToken'
import Individual from 'App/Models/Individual'
import OpeningHour from 'App/Models/OpeningHour'
import Subscription from 'App/Models/Subscription'
import Notification from 'App/Models/Notification'

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
        pushToken?: PushToken
        subscription?: Subscription
        notification?: Notification
    }
}
